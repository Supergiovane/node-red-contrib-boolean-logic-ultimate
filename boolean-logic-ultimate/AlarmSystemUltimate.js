'use strict';

module.exports = function (RED) {
  const helpers = require('./lib/node-helpers.js');

  function AlarmSystemUltimate(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const REDUtil = RED.util;

    const setNodeStatus = helpers.createStatus(node);
    const timerBag = helpers.createTimerBag(node);

    const controlTopic = config.controlTopic || 'alarm';
    const payloadPropName = config.payloadPropName || 'payload';

    const requireCodeForArm = config.requireCodeForArm === true;
    const requireCodeForDisarm = config.requireCodeForDisarm !== false;
    const armCode = typeof config.armCode === 'string' ? config.armCode : '';
    const duressCode = typeof config.duressCode === 'string' ? config.duressCode : '';
    const duressEnabled = duressCode.trim().length > 0;

    const blockArmOnViolations = config.blockArmOnViolations !== false;
    const emitRestoreEvents = config.emitRestoreEvents === true;

    const exitDelayMs = toMilliseconds(config.exitDelaySeconds, 30);
    const entryDelayMs = toMilliseconds(config.entryDelaySeconds, 30);
    const sirenDurationMs = toMilliseconds(config.sirenDurationSeconds, 180);
    const sirenLatchUntilDisarm = config.sirenLatchUntilDisarm === true || Number(config.sirenDurationSeconds) === 0;

    const maxLogEntries = clampInt(config.maxLogEntries, 50, 0, 500);
    const persistState = config.persistState !== false;

    const zoneConfigText = typeof config.zones === 'string' ? config.zones : '';
    let zones = parseZones(zoneConfigText);

    const stateKey = 'AlarmSystemUltimateState';
    let state = restoreState();

    let exitTimer = null;
    let entryTimer = null;
    let sirenTimer = null;
    let statusInterval = null;

    function clampInt(value, defaultValue, min, max) {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return defaultValue;
      }
      return Math.max(min, Math.min(max, Math.trunc(parsed)));
    }

    function toMilliseconds(value, defaultSeconds) {
      const seconds = Number(value);
      if (Number.isFinite(seconds) && seconds >= 0) {
        return seconds * 1000;
      }
      return defaultSeconds * 1000;
    }

    function now() {
      return Date.now();
    }

    function createInitialState() {
      return {
        mode: 'disarmed',
        arming: null,
        entry: null,
        alarmActive: false,
        silentAlarmActive: false,
        sirenActive: false,
        alarmZone: null,
        bypass: {},
        zoneState: {},
        log: [],
      };
    }

    function restoreState() {
      if (!persistState) {
        return createInitialState();
      }
      const saved = node.context().get(stateKey);
      if (!saved || typeof saved !== 'object') {
        return createInitialState();
      }
      const next = createInitialState();
      if (typeof saved.mode === 'string') {
        next.mode = normalizeMode(saved.mode) || 'disarmed';
      }
      if (saved && typeof saved.bypass === 'object') {
        next.bypass = { ...saved.bypass };
      }
      if (Array.isArray(saved.log)) {
        next.log = saved.log.slice(-maxLogEntries);
      }
      return next;
    }

    function persist() {
      if (!persistState) {
        return;
      }
      node.context().set(stateKey, {
        mode: state.mode,
        bypass: state.bypass,
        log: state.log,
      });
    }

    function normalizeMode(value) {
      if (typeof value !== 'string') {
        return null;
      }
      const v = value.toLowerCase().trim();
      if (['disarmed', 'home', 'away', 'night'].includes(v)) {
        return v;
      }
      return null;
    }

    function parseZones(text) {
      const results = [];
      const rawText = String(text || '').trim();
      if (!rawText) {
        return results;
      }

      function pushZone(raw, index) {
        if (!raw || typeof raw !== 'object') {
          return;
        }
        const zone = normalizeZone(raw, index);
        if (zone) {
          results.push(zone);
        }
      }

      try {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed)) {
          parsed.forEach((item, index) => {
            pushZone(item, index);
          });
          return results;
        }
        if (parsed && typeof parsed === 'object') {
          pushZone(parsed, 0);
          return results;
        }
      } catch (err) {
        // fallback to JSON-per-line parsing
      }

      const lines = rawText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        try {
          pushZone(JSON.parse(line), index);
        } catch (err) {
          node.log(`AlarmSystemUltimate: unable to parse zone line: ${line}`);
        }
      }
      return results;
    }

    function normalizeZone(raw, index) {
      const zone = { ...raw };
      zone.id = String(zone.id || zone.name || zone.topic || `zone${index + 1}`).trim();
      if (!zone.id) {
        return null;
      }
      zone.name = String(zone.name || zone.id).trim();

      if (typeof zone.topic === 'string') {
        zone.topic = zone.topic.trim();
      }
      if (typeof zone.topicPattern === 'string') {
        zone.topicPattern = zone.topicPattern.trim();
      }
      if (!zone.topic && !zone.topicPattern) {
        return null;
      }

      zone.topicPrefix = null;
      if (zone.topic && zone.topic.endsWith('*')) {
        zone.topicPrefix = zone.topic.slice(0, -1);
      }

      zone.topicRegex = null;
      if (zone.topicPattern) {
        try {
          zone.topicRegex = new RegExp(zone.topicPattern);
        } catch (err) {
          node.log(`AlarmSystemUltimate: invalid topicPattern for zone ${zone.id}`);
          return null;
        }
      }

      const type = typeof zone.type === 'string' ? zone.type.toLowerCase().trim() : 'perimeter';
      zone.type = type || 'perimeter';

      zone.entry = zone.entry === true;
      zone.bypassable = zone.bypassable !== false;
      zone.chime = zone.chime === true;
      zone.instantDuringExit = zone.instantDuringExit === true;

      zone.entryDelayMs = toMilliseconds(zone.entryDelaySeconds, entryDelayMs / 1000);
      zone.cooldownMs = toMilliseconds(zone.cooldownSeconds, 0);

      if (Array.isArray(zone.modes)) {
        zone.modes = zone.modes
          .map((m) => normalizeMode(m))
          .filter(Boolean);
      } else if (typeof zone.modes === 'string') {
        zone.modes = zone.modes
          .split(',')
          .map((m) => normalizeMode(m))
          .filter(Boolean);
      } else {
        zone.modes = [];
      }
      zone.alwaysActive = zone.type === 'fire' || zone.type === 'tamper' || zone.type === '24h';

      return zone;
    }

    function findZone(topic) {
      if (!topic) {
        return null;
      }
      for (const zone of zones) {
        if (zone.topic && zone.topic === topic) {
          return zone;
        }
        if (zone.topicPrefix && topic.startsWith(zone.topicPrefix)) {
          return zone;
        }
        if (zone.topicRegex && zone.topicRegex.test(topic)) {
          return zone;
        }
      }
      return null;
    }

    function startStatusInterval() {
      if (statusInterval) {
        return;
      }
      statusInterval = timerBag.setInterval(() => {
        updateStatus();
      }, 1000);
    }

    function stopStatusIntervalIfIdle() {
      if (!statusInterval) {
        return;
      }
      if (state.arming || state.entry || state.alarmActive || state.sirenActive) {
        return;
      }
      timerBag.clearInterval(statusInterval);
      statusInterval = null;
    }

    function remainingSeconds(until) {
      return Math.max(0, Math.ceil((until - now()) / 1000));
    }

    function updateStatus() {
      let fill = 'grey';
      let shape = 'ring';
      let text = 'DISARMED';

      if (state.alarmActive) {
        fill = 'red';
        shape = 'dot';
        text = `ALARM${state.silentAlarmActive ? ' (silent)' : ''}`;
      } else if (state.entry) {
        fill = 'yellow';
        shape = 'dot';
        text = `ENTRY ${remainingSeconds(state.entry.until)}s`;
      } else if (state.arming) {
        fill = 'yellow';
        shape = 'dot';
        text = `ARMING ${state.arming.mode.toUpperCase()} ${remainingSeconds(state.arming.until)}s`;
      } else if (state.mode !== 'disarmed') {
        fill = 'green';
        shape = 'dot';
        text = `ARMED ${state.mode.toUpperCase()}`;
      }

      setNodeStatus({ fill, shape, text });
      stopStatusIntervalIfIdle();
    }

    function pushLog(event) {
      if (!maxLogEntries) {
        return;
      }
      state.log.push({ ...event, ts: now() });
      if (state.log.length > maxLogEntries) {
        state.log.splice(0, state.log.length - maxLogEntries);
      }
      persist();
    }

    function buildOutputMessage(type, value, baseMsg) {
      const msg = baseMsg ? REDUtil.cloneMessage(baseMsg) : {};
      try {
        msg.payload = REDUtil.evaluateNodeProperty(value, type, node, baseMsg);
      } catch (err) {
        msg.payload = value;
      }
      return msg;
    }

    function emitEvent(event, details, baseMsg) {
      const msg = baseMsg ? REDUtil.cloneMessage(baseMsg) : {};
      msg.topic = `${controlTopic}/event`;
      msg.event = event;
      msg.payload = {
        event,
        mode: state.mode,
        ...(details || {}),
      };
      node.send([msg, null]);
      pushLog({ event, ...(details || {}) });
      updateStatus();
    }

    function emitStatus(baseMsg) {
      emitEvent(
        'status',
        {
          state: snapshotState(),
        },
        baseMsg
      );
    }

    function snapshotState() {
      const bypassed = Object.keys(state.bypass || {}).filter((k) => state.bypass[k] === true);
      return {
        mode: state.mode,
        arming: state.arming
          ? { active: true, target: state.arming.mode, remaining: remainingSeconds(state.arming.until) }
          : { active: false },
        entry: state.entry
          ? { active: true, zone: state.entry.zoneId, remaining: remainingSeconds(state.entry.until) }
          : { active: false },
        alarmActive: state.alarmActive,
        silentAlarmActive: state.silentAlarmActive,
        sirenActive: state.sirenActive,
        alarmZone: state.alarmZone,
        bypassedZones: bypassed,
        log: state.log.slice(-10),
      };
    }

    function sendSiren(active, baseMsg, reason) {
      const topic = config.sirenTopic || `${controlTopic}/siren`;
      const type = active ? config.sirenOnPayloadType || 'bool' : config.sirenOffPayloadType || 'bool';
      const value = active ? config.sirenOnPayload : config.sirenOffPayload;
      const msg = buildOutputMessage(type, value, baseMsg);
      msg.topic = topic;
      msg.event = active ? 'siren_on' : 'siren_off';
      msg.reason = reason;
      node.send([null, msg]);
    }

    function clearExitTimer() {
      if (exitTimer) {
        timerBag.clearTimeout(exitTimer);
        exitTimer = null;
      }
    }

    function clearEntryTimer() {
      if (entryTimer) {
        timerBag.clearTimeout(entryTimer);
        entryTimer = null;
      }
    }

    function clearSirenTimer() {
      if (sirenTimer) {
        timerBag.clearTimeout(sirenTimer);
        sirenTimer = null;
      }
    }

    function stopSiren(baseMsg, reason) {
      if (!state.sirenActive) {
        return;
      }
      clearSirenTimer();
      state.sirenActive = false;
      sendSiren(false, baseMsg, reason);
      emitEvent('siren_off', { reason }, baseMsg);
    }

    function startSiren(baseMsg, reason) {
      if (state.sirenActive) {
        return;
      }
      state.sirenActive = true;
      node.send([
        buildEventMessage('siren_on', { reason }, baseMsg),
        buildSirenMessage(true, baseMsg, reason),
      ]);
      pushLog({ event: 'siren_on', reason });
      updateStatus();

      if (sirenLatchUntilDisarm) {
        return;
      }
      if (sirenDurationMs <= 0) {
        return;
      }
      clearSirenTimer();
      sirenTimer = timerBag.setTimeout(() => {
        stopSiren(baseMsg, 'timeout');
      }, sirenDurationMs);
    }

    function buildEventMessage(event, details, baseMsg) {
      const msg = baseMsg ? REDUtil.cloneMessage(baseMsg) : {};
      msg.topic = `${controlTopic}/event`;
      msg.event = event;
      msg.payload = {
        event,
        mode: state.mode,
        ...(details || {}),
      };
      return msg;
    }

    function buildSirenMessage(active, baseMsg, reason) {
      const topic = config.sirenTopic || `${controlTopic}/siren`;
      const type = active ? config.sirenOnPayloadType || 'bool' : config.sirenOffPayloadType || 'bool';
      const value = active ? config.sirenOnPayload : config.sirenOffPayload;
      const msg = buildOutputMessage(type, value, baseMsg);
      msg.topic = topic;
      msg.event = active ? 'siren_on' : 'siren_off';
      msg.reason = reason;
      return msg;
    }

    function triggerAlarm(kind, zone, baseMsg, silent) {
      if (state.alarmActive) {
        return;
      }
      state.alarmActive = true;
      state.alarmZone = zone ? zone.id : null;
      state.silentAlarmActive = Boolean(silent);
      clearExitTimer();
      clearEntryTimer();
      state.arming = null;
      state.entry = null;
      startStatusInterval();

      const eventMsg = buildEventMessage('alarm', {
        kind,
        zone: zone ? { id: zone.id, name: zone.name, type: zone.type, topic: zone.topic || zone.topicPattern } : null,
        silent: Boolean(silent),
      }, baseMsg);

      let sirenMsg = null;
      if (!silent || (zone && zone.type === 'fire')) {
        if (!state.sirenActive) {
          state.sirenActive = true;
          sirenMsg = buildSirenMessage(true, baseMsg, kind);
          if (!sirenLatchUntilDisarm && sirenDurationMs > 0) {
            clearSirenTimer();
            sirenTimer = timerBag.setTimeout(() => {
              stopSiren(baseMsg, 'timeout');
            }, sirenDurationMs);
          }
        }
      }

      node.send([eventMsg, sirenMsg]);
      pushLog({
        event: 'alarm',
        kind,
        silent: Boolean(silent),
        zone: zone ? { id: zone.id, name: zone.name, type: zone.type } : null,
      });
      updateStatus();
    }

    function disarm(baseMsg, reason, duress) {
      clearExitTimer();
      clearEntryTimer();
      state.arming = null;
      state.entry = null;
      state.alarmActive = false;
      state.silentAlarmActive = false;
      state.alarmZone = null;
      if (state.sirenActive) {
        stopSiren(baseMsg, 'disarm');
      }
      state.mode = 'disarmed';
      persist();
      emitEvent('disarmed', { reason, duress: Boolean(duress) }, baseMsg);
    }

    function violatedZonesForMode(mode) {
      const violations = [];
      for (const zone of zones) {
        if (!zone || zone.alwaysActive) {
          continue;
        }
        if (!zoneArmedInMode(zone, mode)) {
          continue;
        }
        if (state.bypass[zone.id] === true) {
          continue;
        }
        const zoneState = state.zoneState[zone.id];
        if (zoneState && zoneState.active === true) {
          violations.push({ id: zone.id, name: zone.name, type: zone.type });
        }
      }
      return violations;
    }

    function arm(mode, baseMsg, reason) {
      const normalized = normalizeMode(mode);
      if (!normalized || normalized === 'disarmed') {
        return;
      }
      if (state.mode === normalized && !state.arming) {
        emitEvent('already_armed', { mode: normalized }, baseMsg);
        return;
      }

      const violations = blockArmOnViolations ? violatedZonesForMode(normalized) : [];
      if (blockArmOnViolations && violations.length > 0) {
        emitEvent('arm_blocked', { mode: normalized, violations }, baseMsg);
        return;
      }

      clearExitTimer();
      clearEntryTimer();
      state.entry = null;
      state.alarmActive = false;
      state.silentAlarmActive = false;
      state.alarmZone = null;
      if (state.sirenActive) {
        stopSiren(baseMsg, 'arm');
      }

      if (exitDelayMs <= 0) {
        state.mode = normalized;
        state.arming = null;
        persist();
        emitEvent('armed', { mode: normalized, reason }, baseMsg);
        return;
      }

      const until = now() + exitDelayMs;
      state.arming = { mode: normalized, until };
      persist();
      emitEvent('arming', { mode: normalized, seconds: remainingSeconds(until), reason }, baseMsg);
      startStatusInterval();

      exitTimer = timerBag.setTimeout(() => {
        const stillArming = state.arming && state.arming.mode === normalized;
        if (!stillArming) {
          return;
        }
        const followUpViolations = blockArmOnViolations ? violatedZonesForMode(normalized) : [];
        if (blockArmOnViolations && followUpViolations.length > 0) {
          state.arming = null;
          persist();
          emitEvent('arm_blocked', { mode: normalized, violations: followUpViolations }, baseMsg);
          return;
        }
        state.mode = normalized;
        state.arming = null;
        persist();
        emitEvent('armed', { mode: normalized, reason }, baseMsg);
      }, exitDelayMs);
    }

    function zoneArmedInMode(zone, mode) {
      if (!zone || zone.alwaysActive) {
        return true;
      }
      if (!mode || mode === 'disarmed') {
        return false;
      }
      if (!Array.isArray(zone.modes) || zone.modes.length === 0) {
        return true;
      }
      return zone.modes.includes(mode);
    }

    function startEntryDelay(zone, baseMsg) {
      if (state.entry) {
        return;
      }
      const delay = zone && Number.isFinite(zone.entryDelayMs) ? zone.entryDelayMs : entryDelayMs;
      if (delay <= 0) {
        triggerAlarm('instant', zone, baseMsg, false);
        return;
      }
      const until = now() + delay;
      state.entry = { zoneId: zone.id, until };
      emitEvent('entry_delay', { zone: { id: zone.id, name: zone.name }, seconds: remainingSeconds(until) }, baseMsg);
      startStatusInterval();
      clearEntryTimer();
      entryTimer = timerBag.setTimeout(() => {
        if (!state.entry || state.entry.zoneId !== zone.id) {
          return;
        }
        state.entry = null;
        triggerAlarm('entry_timeout', zone, baseMsg, false);
      }, delay);
    }

    function shouldConsumeControlMessage(msg) {
      if (!msg || typeof msg !== 'object') {
        return false;
      }
      if (msg.topic !== controlTopic) {
        return false;
      }
      return true;
    }

    function resolveCode(msg) {
      if (!msg || typeof msg !== 'object') {
        return '';
      }
      if (typeof msg.code === 'string') {
        return msg.code;
      }
      if (typeof msg.pin === 'string') {
        return msg.pin;
      }
      return '';
    }

    function validateCode(msg, action) {
      const provided = resolveCode(msg).trim();
      const expects = action === 'arm' ? requireCodeForArm : requireCodeForDisarm;
      if (!expects) {
        return { ok: true, duress: false };
      }
      if (!armCode.trim()) {
        return { ok: true, duress: false };
      }
      if (provided && duressEnabled && provided === duressCode) {
        return { ok: true, duress: true };
      }
      if (provided && provided === armCode) {
        return { ok: true, duress: false };
      }
      return { ok: false, duress: false };
    }

    function setBypass(zoneId, enabled, baseMsg) {
      const id = String(zoneId || '').trim();
      if (!id) {
        emitEvent('error', { error: 'missing_zone' }, baseMsg);
        return;
      }
      const zone = zones.find((z) => z && z.id === id);
      if (!zone) {
        emitEvent('error', { error: 'unknown_zone', zone: id }, baseMsg);
        return;
      }
      if (enabled && zone.bypassable === false) {
        emitEvent('error', { error: 'zone_not_bypassable', zone: id }, baseMsg);
        return;
      }
      state.bypass[id] = Boolean(enabled);
      persist();
      emitEvent(enabled ? 'bypassed' : 'unbypassed', { zone: { id: zone.id, name: zone.name } }, baseMsg);
    }

    function handleControlMessage(msg) {
      const command = typeof msg.command === 'string' ? msg.command.toLowerCase().trim() : '';
      if (msg.reset === true || command === 'reset') {
        clearExitTimer();
        clearEntryTimer();
        clearSirenTimer();
        state = createInitialState();
        persist();
        emitEvent('reset', {}, msg);
        return true;
      }

      if (msg.status === true || command === 'status') {
        emitStatus(msg);
        return true;
      }

      if (command === 'bypass' || msg.bypass === true) {
        setBypass(msg.zone || msg.zoneId || msg.zoneName, true, msg);
        return true;
      }
      if (command === 'unbypass' || msg.unbypass === true) {
        setBypass(msg.zone || msg.zoneId || msg.zoneName, false, msg);
        return true;
      }

      if (command === 'siren_on') {
        startSiren(msg, 'manual');
        return true;
      }
      if (command === 'siren_off') {
        stopSiren(msg, 'manual');
        return true;
      }

      if (command === 'panic' || msg.panic === true) {
        triggerAlarm('panic', null, msg, false);
        return true;
      }
      if (command === 'panic_silent' || command === 'silent_panic') {
        triggerAlarm('panic', null, msg, true);
        return true;
      }

      if (command === 'disarm' || msg.disarm === true) {
        const validation = validateCode(msg, 'disarm');
        if (!validation.ok) {
          emitEvent('denied', { action: 'disarm' }, msg);
          return true;
        }
        if (validation.duress) {
          triggerAlarm('duress', null, msg, true);
          disarm(msg, 'duress', true);
          return true;
        }
        disarm(msg, 'manual', false);
        return true;
      }

      const requestedMode =
        normalizeMode(msg.arm) ||
        normalizeMode(msg.mode) ||
        (command === 'arm_away' ? 'away' : null) ||
        (command === 'arm_home' ? 'home' : null) ||
        (command === 'arm_night' ? 'night' : null);

      if (requestedMode && requestedMode !== 'disarmed') {
        const validation = validateCode(msg, 'arm');
        if (!validation.ok) {
          emitEvent('denied', { action: 'arm', mode: requestedMode }, msg);
          return true;
        }
        if (validation.duress) {
          triggerAlarm('duress', null, msg, true);
        }
        arm(requestedMode, msg, 'manual');
        return true;
      }

      return false;
    }

    function handleSensorMessage(msg) {
      const zone = findZone(msg.topic);
      if (!zone) {
        return;
      }
      const resolved = helpers.resolveInput(msg, payloadPropName, config.translatorConfig, RED);
      const value = resolved.boolean;
      if (value === undefined) {
        return;
      }

      const zoneMeta = state.zoneState[zone.id] || { active: false, lastChangeAt: 0, lastTriggerAt: 0 };
      const changed = zoneMeta.active !== value;
      zoneMeta.active = value;
      zoneMeta.lastChangeAt = now();
      state.zoneState[zone.id] = zoneMeta;

      if (changed && emitRestoreEvents && value === false) {
        emitEvent('zone_restore', { zone: { id: zone.id, name: zone.name, type: zone.type } }, msg);
      }

      if (value !== true) {
        return;
      }

      if (state.bypass[zone.id] === true && zone.bypassable !== false) {
        emitEvent('zone_bypassed_trigger', { zone: { id: zone.id, name: zone.name, type: zone.type } }, msg);
        return;
      }

      const cooldownMs = Number(zone.cooldownMs) || 0;
      if (cooldownMs > 0 && zoneMeta.lastTriggerAt && now() - zoneMeta.lastTriggerAt < cooldownMs) {
        return;
      }
      zoneMeta.lastTriggerAt = now();
      state.zoneState[zone.id] = zoneMeta;

      if (zone.alwaysActive) {
        triggerAlarm(zone.type, zone, msg, false);
        return;
      }

      if (state.arming && !zone.instantDuringExit) {
        emitEvent('zone_ignored_exit', { zone: { id: zone.id, name: zone.name, type: zone.type } }, msg);
        return;
      }

      if (state.mode === 'disarmed') {
        if (zone.chime) {
          emitEvent('chime', { zone: { id: zone.id, name: zone.name, type: zone.type } }, msg);
        }
        return;
      }

      if (!zoneArmedInMode(zone, state.mode)) {
        return;
      }

      if (zone.entry) {
        startEntryDelay(zone, msg);
        return;
      }
      triggerAlarm('instant', zone, msg, false);
    }

    node.on('input', (msg) => {
      if (shouldConsumeControlMessage(msg)) {
        if (handleControlMessage(msg)) {
          return;
        }
      }
      handleSensorMessage(msg);
    });

    updateStatus();
  }

  RED.nodes.registerType('AlarmSystemUltimate', AlarmSystemUltimate);
};
