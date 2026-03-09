/* app.js — RL Methods: Model-Based MC, Model-Free MC, SARSA, Q-Learning */
(function () {
  'use strict';

  // ============ GRID DEFINITION ============
  var ROWS = 3;
  var COLS = 4;

  var CELL_NORMAL = 'normal';
  var CELL_GOAL = 'goal';
  var CELL_VOLCANO = 'volcano';
  var CELL_START = 'start';
  var CELL_SMALL_REWARD = 'small_reward';

  function getCellType(r, c) {
    if (r === 0 && c === 3) return CELL_GOAL;
    if (r === 0 && c === 2) return CELL_VOLCANO;
    if (r === 1 && c === 2) return CELL_VOLCANO;
    if (r === 1 && c === 0) return CELL_START;
    if (r === 2 && c === 0) return CELL_SMALL_REWARD;
    return CELL_NORMAL;
  }

  function isTerminal(r, c) {
    var t = getCellType(r, c);
    return t === CELL_GOAL || t === CELL_VOLCANO || t === CELL_SMALL_REWARD;
  }

  function needsPolicy(r, c) {
    var t = getCellType(r, c);
    return t === CELL_NORMAL || t === CELL_START;
  }

  var DIRS = {
    up:    [-1, 0],
    down:  [1, 0],
    left:  [0, -1],
    right: [0, 1]
  };
  var DIR_NAMES = ['up', 'down', 'left', 'right'];
  var DIR_ARROWS = { up: '\u25B2', down: '\u25BC', left: '\u25C4', right: '\u25BA' };
  var DIR_LETTERS = { up: 'N', down: 'S', left: 'W', right: 'E' };
  var DIR_INDEX = { up: 0, down: 1, left: 2, right: 3 };

  // All tab ids
  var ALL_TABS = ['model-based', 'model-free', 'sarsa', 'q-learning'];
  // Tabs that use Q(s,a) table
  var Q_TABS = ['model-free', 'sarsa', 'q-learning'];
  // Tabs that use TD (need learning rate)
  var TD_TABS = ['sarsa', 'q-learning'];

  // ============ SHARED STATE ============
  var policy = {};
  for (var r0 = 0; r0 < ROWS; r0++) {
    for (var c0 = 0; c0 < COLS; c0++) {
      if (needsPolicy(r0, c0)) {
        policy[r0 + ',' + c0] = 'right';
      }
    }
  }

  // Per-tab state
  function freshTabState() {
    var qCounts = {};
    var qSums = {};
    var qValues = {};
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var key = r + ',' + c;
        qCounts[key] = [0, 0, 0, 0];
        qSums[key] = [0, 0, 0, 0];
        qValues[key] = [0, 0, 0, 0];
      }
    }
    return {
      paths: [], totalUtility: 0,
      // V(s) for model-based
      vCounts: {}, vSums: {},
      // Q(s,a) for model-free MC (incremental mean)
      qCounts: qCounts, qSums: qSums,
      // Q(s,a) for TD methods (SARSA, Q-learning) — direct values
      qValues: qValues,
      // Fog of war
      discovered: {},
      // Parameter discovery
      discoveredParams: { moveReward: false, passReward: false, volcanoReward: false, smallReward: false },
      slipStats: { totalSteps: 0, observedSlips: 0 },
      moveRewardValue: null,
      passRewardValue: null,
      volcanoRewardValue: null,
      smallRewardValue: null
    };
  }

  var tabState = {};
  for (var ti = 0; ti < ALL_TABS.length; ti++) {
    tabState[ALL_TABS[ti]] = freshTabState();
  }

  var activeTab = 'model-based';

  // ============ DOM REFS ============
  var gridEl = document.getElementById('grid-world');
  var pathLogEl = document.getElementById('path-log');
  var statSamplesEl = document.getElementById('stat-samples');
  var statAvgUtilityEl = document.getElementById('stat-avg-utility');
  var statValueEl = document.getElementById('stat-value');
  var eduPanelEl = document.getElementById('edu-panel');
  var vsGridContainer = document.getElementById('vs-grid-container');
  var vsMiniGrid = document.getElementById('vs-mini-grid');
  var qTableContainer = document.getElementById('q-table-container');
  var qTableBody = document.getElementById('q-table-body');
  var explorationGroup = document.getElementById('exploration-group');
  var explorationGroupTD = document.getElementById('exploration-group-td');
  var epsilonSlider = document.getElementById('epsilon-slider');
  var epsilonDisplay = document.getElementById('epsilon-display');
  var gridLegend = document.getElementById('grid-legend');
  var lrRow = document.getElementById('lr-row');
  var lrHint = document.getElementById('hint-lr');
  var paramHeaderRow = document.getElementById('param-header-row');

  // ============ EDUCATIONAL CONTENT ============
  var EDU_CONTENT = {
    'model-based': {
      title: 'Model-Based Monte Carlo',
      description: 'The agent knows T(s,a,s\') and R(s,a,s\'). It samples transitions using the known model probabilities. For each state visited, it averages the discounted future rewards across all sampled paths.',
      formula: 'V(s) = (1/N) \u2211 G\u1D62 where G\u1D62 is the discounted return from path i',
      diff: 'Key idea: We KNOW the model, but instead of solving Bellman equations exactly, we estimate V by sampling.'
    },
    'model-free': {
      title: 'Model-Free Monte Carlo',
      description: 'The agent does NOT know T(s,a,s\') or R(s,a,s\'). It learns by interacting with the environment blindly. For each (state, action) pair visited in an episode, it records the discounted return from that point onward. This builds a Q(s,a) table \u2014 a 12\u00d74 matrix of state-action values.',
      formula: 'Q(s,a) \u2190 Q(s,a) + (1/N(s,a)) \u00b7 (G - Q(s,a))  [first-visit update]',
      diff: 'No model needed. Must wait for the full episode to finish before updating Q values (batch return).'
    },
    'sarsa': {
      title: 'SARSA (On-Policy TD)',
      description: 'Like MC, the agent learns Q(s,a) without a model. But instead of waiting for the episode to end, it updates after EVERY step using the next action actually taken. The update uses (s, a, r, s\', a\') \u2014 hence the name SARSA.',
      formula: 'Q(s,a) \u2190 (1\u2212\u03B7) Q(s,a) + \u03B7 (r + \u03B3 Q(s\',a\'))',
      diff: 'On-policy: bootstraps from Q(s\',a\') where a\' is the action the agent actually takes next (including exploration). Learns Q\u03C0, not Q*.'
    },
    'q-learning': {
      title: 'Q-Learning (Off-Policy TD)',
      description: 'Like SARSA, it updates after each step. But instead of using the next action actually taken, it uses the BEST possible next action. This lets Q-learning converge to Q* regardless of the exploration policy.',
      formula: 'Q(s,a) \u2190 (1\u2212\u03B7) Q(s,a) + \u03B7 (r + \u03B3 max_a\' Q(s\',a\'))',
      diff: 'Off-policy: bootstraps from max Q(s\',a\'), not the action actually taken. Converges to Q* (optimal) even while exploring.'
    }
  };

  // ============ PARAMS ============
  function getParams() {
    function readNum(id, fallback) {
      var v = parseFloat(document.getElementById(id).value);
      return Number.isNaN(v) ? fallback : v;
    }
    return {
      moveReward:    readNum('moveReward', -0.1),
      passReward:    readNum('passReward', 40),
      volcanoReward: readNum('volcanoReward', -50),
      smallReward:   readNum('smallReward', 2),
      slipProb:      Math.min(1, Math.max(0, readNum('slipProb', 0.3))),
      discount:      Math.min(1, Math.max(0, readNum('discount', 0.9))),
      learningRate:  Math.min(1, Math.max(0.001, readNum('learningRate', 0.1)))
    };
  }

  // Get epsilon based on exponential decay: eps(k) = eps0 * decay^k, floored at eps_min
  function getTDEpsilon(tabId) {
    var numEpisodes = tabState[tabId].paths.length;
    var epsInit = parseFloat(document.getElementById('eps-init').value);
    var decay = parseFloat(document.getElementById('eps-decay').value);
    var epsMin = parseFloat(document.getElementById('eps-min').value);
    if (Number.isNaN(epsInit)) epsInit = 1.0;
    if (Number.isNaN(decay)) decay = 0.9995;
    if (Number.isNaN(epsMin)) epsMin = 0.01;

    var eps = Math.max(epsInit * Math.pow(decay, numEpisodes), epsMin);
    return { eps: eps, episode: numEpisodes };
  }

  function updateTDEpsilonDisplay() {
    if (TD_TABS.indexOf(activeTab) === -1) return;
    var info = getTDEpsilon(activeTab);
    var valEl = document.getElementById('eps-current-val');
    var stageEl = document.getElementById('eps-current-stage');
    if (valEl) valEl.textContent = info.eps.toFixed(4);
    if (stageEl) stageEl.textContent = 'Episode ' + info.episode;
  }

  // ============ HELPER: epsilon-greedy action from Q ============
  // Works for both MC q-table (qCounts/qSums) and TD q-table (qValues)
  function chooseEpsilonGreedy(r, c, tabId) {
    var epsilon;
    if (tabId === 'model-free') {
      epsilon = parseFloat(epsilonSlider.value);
    } else if (TD_TABS.indexOf(tabId) !== -1) {
      epsilon = getTDEpsilon(tabId).eps;
    } else {
      epsilon = 0; // model-based follows policy
    }
    var state = tabState[tabId];

    if (Math.random() < epsilon) {
      return DIR_NAMES[Math.floor(Math.random() * 4)];
    }

    var key = r + ',' + c;
    var bestVal = -Infinity;
    var bestActions = [];

    if (tabId === 'model-free') {
      // MC: use qCounts/qSums
      var counts = state.qCounts[key];
      var sums = state.qSums[key];
      for (var a = 0; a < 4; a++) {
        var qVal = counts[a] > 0 ? sums[a] / counts[a] : 0;
        if (qVal > bestVal) {
          bestVal = qVal;
          bestActions = [DIR_NAMES[a]];
        } else if (qVal === bestVal) {
          bestActions.push(DIR_NAMES[a]);
        }
      }
    } else {
      // TD: use qValues directly
      var qv = state.qValues[key];
      for (var a2 = 0; a2 < 4; a2++) {
        if (qv[a2] > bestVal) {
          bestVal = qv[a2];
          bestActions = [DIR_NAMES[a2]];
        } else if (qv[a2] === bestVal) {
          bestActions.push(DIR_NAMES[a2]);
        }
      }
    }

    return bestActions[Math.floor(Math.random() * bestActions.length)];
  }

  // ============ HELPER: step environment ============
  function envStep(r, c, chosenAction, params) {
    var actual, wasSlip = false;
    if (Math.random() < params.slipProb) {
      actual = DIR_NAMES[Math.floor(Math.random() * 4)];
      wasSlip = true;
    } else {
      actual = chosenAction;
    }

    var delta = DIRS[actual];
    var nr = r + delta[0];
    var nc = c + delta[1];
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) { nr = r; nc = c; }

    var reward;
    var done = false;
    if (isTerminal(nr, nc)) {
      done = true;
      var tt = getCellType(nr, nc);
      if (tt === CELL_GOAL) reward = params.moveReward + params.passReward;
      else if (tt === CELL_VOLCANO) reward = params.moveReward + params.volcanoReward;
      else if (tt === CELL_SMALL_REWARD) reward = params.moveReward + params.smallReward;
    } else {
      reward = params.moveReward;
    }

    return { nr: nr, nc: nc, reward: reward, done: done, wasSlip: wasSlip };
  }

  // ============ HELPER: get reward for terminal state ============
  function getTerminalReward(r, c, params) {
    var tt = getCellType(r, c);
    if (tt === CELL_GOAL) return params.moveReward + params.passReward;
    if (tt === CELL_VOLCANO) return params.moveReward + params.volcanoReward;
    if (tt === CELL_SMALL_REWARD) return params.moveReward + params.smallReward;
    return params.moveReward;
  }

  // ============ BUILD GRID ============
  function buildGrid() {
    gridEl.innerHTML = '';
    var state = tabState[activeTab];
    var isQTab = Q_TABS.indexOf(activeTab) !== -1;

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        var key = r + ',' + c;
        var discovered = state.discovered[key];

        if (!discovered) {
          cell.classList.add('cell-fog');
          var fogLabel = document.createElement('span');
          fogLabel.className = 'cell-label';
          fogLabel.textContent = '(' + (r + 1) + ',' + (c + 1) + ')';
          cell.appendChild(fogLabel);
          var fogIcon = document.createElement('span');
          fogIcon.className = 'fog-icon';
          fogIcon.textContent = '?';
          cell.appendChild(fogIcon);
        } else {
          cell.classList.add('cell-discovered');
          var discLabel = document.createElement('span');
          discLabel.className = 'cell-label';
          discLabel.textContent = '(' + (r + 1) + ',' + (c + 1) + ')';
          cell.appendChild(discLabel);

          // Show V(s) estimate for model-based (non-terminal only)
          if (activeTab === 'model-based' && !isTerminal(r, c)) {
            var vCount = state.vCounts[key] || 0;
            if (vCount > 0) {
              var vVal = state.vSums[key] / vCount;
              var vEst = document.createElement('span');
              vEst.className = 'cell-v-estimate';
              if (vVal > 0.01) vEst.classList.add('v-positive');
              else if (vVal < -0.01) vEst.classList.add('v-negative');
              vEst.textContent = 'V=' + vVal.toFixed(2);
              cell.appendChild(vEst);
            }
          }

          // Show best Q-action for Q-based tabs (non-terminal only)
          if (isQTab && !isTerminal(r, c)) {
            var bestDir = getBestQAction(r, c, activeTab);
            if (bestDir !== null) {
              var qArrow = document.createElement('span');
              qArrow.className = 'cell-q-arrow';
              qArrow.textContent = DIR_ARROWS[bestDir];
              cell.appendChild(qArrow);
            }
          }

          if (getCellType(r, c) === CELL_START) {
            var sb = document.createElement('span');
            sb.className = 'start-badge';
            sb.textContent = 'START';
            cell.appendChild(sb);
          }
        }
        gridEl.appendChild(cell);
      }
    }
  }

  // Get the best action from Q-table for a state
  function getBestQAction(r, c, tabId) {
    var state = tabState[tabId];
    var key = r + ',' + c;
    var bestVal = -Infinity;
    var bestDir = null;

    if (tabId === 'model-free') {
      // MC: qCounts/qSums
      var counts = state.qCounts[key];
      var sums = state.qSums[key];
      var anyData = false;
      for (var a = 0; a < 4; a++) {
        if (counts[a] > 0) {
          anyData = true;
          var avg = sums[a] / counts[a];
          if (avg > bestVal) {
            bestVal = avg;
            bestDir = DIR_NAMES[a];
          }
        }
      }
      return anyData ? bestDir : null;
    } else {
      // TD: qValues — always have data (initialized to 0), but only show arrow if any update happened
      var qv = state.qValues[key];
      var anyNonZero = false;
      for (var a2 = 0; a2 < 4; a2++) {
        if (qv[a2] !== 0) anyNonZero = true;
        if (qv[a2] > bestVal) {
          bestVal = qv[a2];
          bestDir = DIR_NAMES[a2];
        }
      }
      return anyNonZero ? bestDir : null;
    }
  }

  // ============ DISCOVER CELLS (FOG OF WAR) ============
  function discoverCells(pathData) {
    var state = tabState[activeTab];
    for (var i = 0; i < pathData.visited.length; i++) {
      var pos = pathData.visited[i];
      state.discovered[pos.r + ',' + pos.c] = true;
    }
  }

  // ============ DISCOVER PARAMETERS ============
  function discoverParams(pathData) {
    var state = tabState[activeTab];
    var params = getParams();
    var rewards = pathData.rewards;
    var visited = pathData.visited;
    var slipped = pathData.slipped;

    if (rewards.length > 0 && !state.discoveredParams.moveReward) {
      state.discoveredParams.moveReward = true;
      state.moveRewardValue = params.moveReward;
    }

    if (visited.length > 1) {
      var lastPos = visited[visited.length - 1];
      var lastType = getCellType(lastPos.r, lastPos.c);
      if (lastType === CELL_GOAL && !state.discoveredParams.passReward) {
        state.discoveredParams.passReward = true;
        state.passRewardValue = params.passReward;
      }
      if (lastType === CELL_VOLCANO && !state.discoveredParams.volcanoReward) {
        state.discoveredParams.volcanoReward = true;
        state.volcanoRewardValue = params.volcanoReward;
      }
      if (lastType === CELL_SMALL_REWARD && !state.discoveredParams.smallReward) {
        state.discoveredParams.smallReward = true;
        state.smallRewardValue = params.smallReward;
      }
    }

    for (var i = 0; i < slipped.length; i++) {
      state.slipStats.totalSteps++;
      if (slipped[i]) {
        state.slipStats.observedSlips++;
      }
    }
  }

  // ============ UPDATE PARAM DISPLAY ============
  function updateParamDisplay() {
    var state = tabState[activeTab];
    var dp = state.discoveredParams;

    var pairs = [
      { id: 'moveReward', discovered: dp.moveReward, value: state.moveRewardValue, prefix: '', hintYes: 'Discovered after first step' },
      { id: 'passReward', discovered: dp.passReward, value: state.passRewardValue, prefix: '+', hintYes: 'Discovered: agent reached goal' },
      { id: 'smallReward', discovered: dp.smallReward, value: state.smallRewardValue, prefix: '+', hintYes: 'Discovered: agent found small reward' },
      { id: 'volcanoReward', discovered: dp.volcanoReward, value: state.volcanoRewardValue, prefix: '', hintYes: 'Discovered: agent fell into volcano' }
    ];

    for (var i = 0; i < pairs.length; i++) {
      var p = pairs[i];
      var el = document.getElementById('disp-' + p.id);
      var hint = document.getElementById('hint-' + p.id);
      if (p.discovered && p.value !== null) {
        el.textContent = (p.value >= 0 && p.prefix ? p.prefix : '') + p.value;
        el.classList.add('revealed');
        hint.textContent = p.hintYes;
        hint.classList.add('hint-revealed');
      } else {
        el.textContent = '?';
        el.classList.remove('revealed');
        hint.textContent = 'Unknown to the agent';
        hint.classList.remove('hint-revealed');
      }
    }

    // slipProb
    var slipEl = document.getElementById('disp-slipProb');
    var slipHint = document.getElementById('hint-slipProb');
    if (state.slipStats.totalSteps > 0) {
      var estimate = state.slipStats.observedSlips / state.slipStats.totalSteps;
      slipEl.textContent = estimate.toFixed(2);
      slipEl.classList.add('revealed');
      slipHint.textContent = 'Estimated: ' + state.slipStats.observedSlips + ' slips / ' + state.slipStats.totalSteps + ' steps';
      slipHint.classList.add('hint-revealed');
    } else {
      slipEl.textContent = '?';
      slipEl.classList.remove('revealed');
      slipHint.textContent = 'Unknown to the agent';
      slipHint.classList.remove('hint-revealed');
    }
  }

  // ============ V(s) MINI GRID (model-based) ============
  function buildVsMiniGrid() {
    vsMiniGrid.innerHTML = '';
    var state = tabState[activeTab];

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var cell = document.createElement('div');
        cell.className = 'vs-cell';
        var key = r + ',' + c;

        if (isTerminal(r, c)) {
          cell.classList.add('vs-terminal');
          cell.textContent = state.discovered[key] ? '\u00b7' : '?';
        } else {
          var count = state.vCounts[key] || 0;
          if (count === 0) {
            cell.textContent = '\u2014';
          } else {
            var val = state.vSums[key] / count;
            cell.textContent = val.toFixed(2);
            if (val > 0.01) cell.classList.add('vs-positive');
            else if (val < -0.01) cell.classList.add('vs-negative');
          }
        }

        vsMiniGrid.appendChild(cell);
      }
    }
  }

  // ============ Q(s,a) TABLE ============
  function buildQTable() {
    qTableBody.innerHTML = '';
    var state = tabState[activeTab];
    var isTD = TD_TABS.indexOf(activeTab) !== -1;

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var key = r + ',' + c;
        var row = document.createElement('tr');

        // State cell
        var stateCell = document.createElement('td');
        stateCell.className = 'q-state-cell';
        stateCell.textContent = '(' + (r + 1) + ',' + (c + 1) + ')';
        if (isTerminal(r, c)) stateCell.classList.add('q-terminal');
        row.appendChild(stateCell);

        // Find best action for highlighting
        var bestA = -1;
        var bestVal = -Infinity;

        if (isTD) {
          var qv = state.qValues[key];
          var anyNonZero = false;
          for (var a3 = 0; a3 < 4; a3++) {
            if (qv[a3] !== 0) anyNonZero = true;
            if (qv[a3] > bestVal) { bestVal = qv[a3]; bestA = a3; }
          }
          if (!anyNonZero) bestA = -1;
        } else {
          var counts = state.qCounts[key];
          var sums = state.qSums[key];
          for (var a2 = 0; a2 < 4; a2++) {
            if (counts[a2] > 0) {
              var v = sums[a2] / counts[a2];
              if (v > bestVal) { bestVal = v; bestA = a2; }
            }
          }
        }

        // One cell per action (N, S, W, E)
        for (var a = 0; a < 4; a++) {
          var td = document.createElement('td');
          td.className = 'q-value-cell';

          if (isTerminal(r, c)) {
            td.textContent = '\u00b7';
            td.classList.add('q-terminal');
          } else if (isTD) {
            var qVal2 = state.qValues[key][a];
            if (qVal2 === 0 && !state.discovered[key]) {
              td.textContent = '\u2014';
              td.classList.add('q-empty');
            } else {
              td.textContent = qVal2.toFixed(2);
              if (a === bestA) td.classList.add('q-best');
              if (qVal2 > 0.01) td.classList.add('q-positive');
              else if (qVal2 < -0.01) td.classList.add('q-negative');
            }
          } else {
            // MC
            var mcCounts = state.qCounts[key];
            var mcSums = state.qSums[key];
            if (mcCounts[a] === 0) {
              td.textContent = '\u2014';
              td.classList.add('q-empty');
            } else {
              var qValMC = mcSums[a] / mcCounts[a];
              td.textContent = qValMC.toFixed(2);
              if (a === bestA) td.classList.add('q-best');
              if (qValMC > 0.01) td.classList.add('q-positive');
              else if (qValMC < -0.01) td.classList.add('q-negative');
            }
          }

          row.appendChild(td);
        }

        qTableBody.appendChild(row);
      }
    }
  }

  // ============ SAMPLING ============

  // Model-Based: uses known slip probability, follows policy
  function sampleEpisodeModelBased() {
    var params = getParams();
    var r = 1, c = 0;
    var visited = [{ r: r, c: c }];
    var rewards = [];
    var actions = [];
    var slipped = [];
    var steps = 0;

    while (steps < 100) {
      var intended = policy[r + ',' + c] || 'right';
      var result = envStep(r, c, intended, params);

      actions.push(intended);
      visited.push({ r: result.nr, c: result.nc });
      rewards.push(result.reward);
      slipped.push(result.wasSlip);

      if (result.done) break;
      r = result.nr;
      c = result.nc;
      steps++;
    }

    var utility = 0;
    var gamma = params.discount;
    for (var i = 0; i < rewards.length; i++) {
      utility += Math.pow(gamma, i) * rewards[i];
    }
    return { visited: visited, rewards: rewards, actions: actions, utility: utility, gamma: gamma, slipped: slipped };
  }

  // Model-Free MC: epsilon-greedy over Q-table, batch return update
  function sampleEpisodeModelFree() {
    var params = getParams();
    var r = 1, c = 0;
    var visited = [{ r: r, c: c }];
    var rewards = [];
    var actions = [];
    var slipped = [];
    var steps = 0;

    while (steps < 100) {
      var chosen = chooseEpsilonGreedy(r, c, 'model-free');
      var result = envStep(r, c, chosen, params);

      actions.push(chosen);
      visited.push({ r: result.nr, c: result.nc });
      rewards.push(result.reward);
      slipped.push(result.wasSlip);

      if (result.done) break;
      r = result.nr;
      c = result.nc;
      steps++;
    }

    var utility = 0;
    var gamma = params.discount;
    for (var i = 0; i < rewards.length; i++) {
      utility += Math.pow(gamma, i) * rewards[i];
    }
    return { visited: visited, rewards: rewards, actions: actions, utility: utility, gamma: gamma, slipped: slipped };
  }

  function getTDMaxSteps() {
    return parseInt(document.getElementById('td-max-steps').value) || 100;
  }

  // SARSA: epsilon-greedy, step-by-step TD update with Q(s',a')
  function sampleEpisodeSARSA() {
    var params = getParams();
    var eta = params.learningRate;
    var gamma = params.discount;
    var maxSteps = getTDMaxSteps();
    var state = tabState['sarsa'];
    var r = 1, c = 0;
    var visited = [{ r: r, c: c }];
    var rewards = [];
    var actions = [];
    var slipped = [];
    var steps = 0;

    // Choose initial action
    var chosenAction = chooseEpsilonGreedy(r, c, 'sarsa');

    while (steps < maxSteps) {
      var result = envStep(r, c, chosenAction, params);

      actions.push(chosenAction);
      visited.push({ r: result.nr, c: result.nc });
      rewards.push(result.reward);
      slipped.push(result.wasSlip);

      var sKey = r + ',' + c;
      var aIdx = DIR_INDEX[chosenAction];

      if (result.done) {
        // Terminal: Q(s',a') = 0
        state.qValues[sKey][aIdx] = (1 - eta) * state.qValues[sKey][aIdx] + eta * result.reward;
        break;
      }

      // Choose a' from s' (on-policy)
      var nextAction = chooseEpsilonGreedy(result.nr, result.nc, 'sarsa');
      var nextKey = result.nr + ',' + result.nc;
      var nextAIdx = DIR_INDEX[nextAction];

      // SARSA update: Q(s,a) <- (1-eta) Q(s,a) + eta (r + gamma Q(s',a'))
      state.qValues[sKey][aIdx] = (1 - eta) * state.qValues[sKey][aIdx] + eta * (result.reward + gamma * state.qValues[nextKey][nextAIdx]);

      r = result.nr;
      c = result.nc;
      chosenAction = nextAction;
      steps++;
    }

    var utility = 0;
    for (var i = 0; i < rewards.length; i++) {
      utility += Math.pow(gamma, i) * rewards[i];
    }
    return { visited: visited, rewards: rewards, actions: actions, utility: utility, gamma: gamma, slipped: slipped };
  }

  // Q-Learning: epsilon-greedy behavior, step-by-step TD update with max Q(s',a')
  function sampleEpisodeQLearning() {
    var params = getParams();
    var eta = params.learningRate;
    var gamma = params.discount;
    var maxSteps = getTDMaxSteps();
    var state = tabState['q-learning'];
    var r = 1, c = 0;
    var visited = [{ r: r, c: c }];
    var rewards = [];
    var actions = [];
    var slipped = [];
    var steps = 0;

    while (steps < maxSteps) {
      var chosen = chooseEpsilonGreedy(r, c, 'q-learning');
      var result = envStep(r, c, chosen, params);

      actions.push(chosen);
      visited.push({ r: result.nr, c: result.nc });
      rewards.push(result.reward);
      slipped.push(result.wasSlip);

      var sKey = r + ',' + c;
      var aIdx = DIR_INDEX[chosen];

      if (result.done) {
        // Terminal: max Q(s',a') = 0
        state.qValues[sKey][aIdx] = (1 - eta) * state.qValues[sKey][aIdx] + eta * result.reward;
        break;
      }

      // Q-Learning update: Q(s,a) <- (1-eta) Q(s,a) + eta (r + gamma max_a' Q(s',a'))
      var nextKey = result.nr + ',' + result.nc;
      var maxQ = -Infinity;
      var qv = state.qValues[nextKey];
      for (var a = 0; a < 4; a++) {
        if (qv[a] > maxQ) maxQ = qv[a];
      }
      state.qValues[sKey][aIdx] = (1 - eta) * state.qValues[sKey][aIdx] + eta * (result.reward + gamma * maxQ);

      r = result.nr;
      c = result.nc;
      steps++;
    }

    var utility = 0;
    for (var i = 0; i < rewards.length; i++) {
      utility += Math.pow(gamma, i) * rewards[i];
    }
    return { visited: visited, rewards: rewards, actions: actions, utility: utility, gamma: gamma, slipped: slipped };
  }

  // Update V(s) for model-based (every-visit)
  function updateVValues(pathData) {
    var state = tabState['model-based'];
    var gamma = pathData.gamma;
    var rewards = pathData.rewards;
    var visited = pathData.visited;

    var returns = new Array(rewards.length);
    var G = 0;
    for (var t = rewards.length - 1; t >= 0; t--) {
      G = rewards[t] + gamma * G;
      returns[t] = G;
    }
    for (var t2 = 0; t2 < rewards.length; t2++) {
      var pos = visited[t2];
      var key = pos.r + ',' + pos.c;
      if (!isTerminal(pos.r, pos.c)) {
        if (!state.vCounts[key]) { state.vCounts[key] = 0; state.vSums[key] = 0; }
        state.vCounts[key]++;
        state.vSums[key] += returns[t2];
      }
    }
  }

  // Update Q(s,a) for model-free MC (first-visit)
  function updateQValues(pathData) {
    var state = tabState['model-free'];
    var gamma = pathData.gamma;
    var rewards = pathData.rewards;
    var visited = pathData.visited;
    var actions = pathData.actions;

    var returns = new Array(rewards.length);
    var G = 0;
    for (var t = rewards.length - 1; t >= 0; t--) {
      G = rewards[t] + gamma * G;
      returns[t] = G;
    }

    var seen = {};
    for (var t2 = 0; t2 < rewards.length; t2++) {
      var pos = visited[t2];
      var aIdx = DIR_INDEX[actions[t2]];
      var saKey = pos.r + ',' + pos.c + ',' + aIdx;
      if (!isTerminal(pos.r, pos.c) && !seen[saKey]) {
        seen[saKey] = true;
        var sKey = pos.r + ',' + pos.c;
        state.qCounts[sKey][aIdx]++;
        state.qSums[sKey][aIdx] += returns[t2];
      }
    }
  }

  // ============ STATS ============
  function updateStats() {
    var state = tabState[activeTab];
    statSamplesEl.textContent = state.paths.length;

    if (state.paths.length === 0) {
      statAvgUtilityEl.textContent = '\u2014';
      statValueEl.textContent = '\u2014';
    } else {
      var avg = state.totalUtility / state.paths.length;
      statAvgUtilityEl.textContent = avg.toFixed(4);

      if (activeTab === 'model-based') {
        var startKey = '1,0';
        var startCount = state.vCounts[startKey] || 0;
        if (startCount > 0) {
          statValueEl.textContent = (state.vSums[startKey] / startCount).toFixed(4);
        } else {
          statValueEl.textContent = avg.toFixed(4);
        }
      } else if (activeTab === 'model-free') {
        // MC: max Q(start, a)
        var startKey2 = '1,0';
        var maxQ = -Infinity;
        var anyQ = false;
        for (var a = 0; a < 4; a++) {
          if (state.qCounts[startKey2][a] > 0) {
            anyQ = true;
            var q = state.qSums[startKey2][a] / state.qCounts[startKey2][a];
            if (q > maxQ) maxQ = q;
          }
        }
        statValueEl.textContent = anyQ ? maxQ.toFixed(4) : avg.toFixed(4);
      } else {
        // TD: max Q(start, a) from qValues
        var startKey3 = '1,0';
        var qv = state.qValues[startKey3];
        var maxQ2 = -Infinity;
        var anyNonZero = false;
        for (var a2 = 0; a2 < 4; a2++) {
          if (qv[a2] !== 0) anyNonZero = true;
          if (qv[a2] > maxQ2) maxQ2 = qv[a2];
        }
        statValueEl.textContent = anyNonZero ? maxQ2.toFixed(4) : avg.toFixed(4);
      }
    }

    statValueEl.classList.remove('value-pulse');
    void statValueEl.offsetWidth;
    statValueEl.classList.add('value-pulse');

    // Show appropriate table
    if (activeTab === 'model-based') {
      vsGridContainer.style.display = 'block';
      qTableContainer.style.display = 'none';
      buildVsMiniGrid();
    } else {
      vsGridContainer.style.display = 'none';
      qTableContainer.style.display = 'block';
      buildQTable();
    }
  }

  // ============ PATH VISUALIZATION ============
  function clearPathVisualization() {
    gridEl.querySelectorAll('.step-marker').forEach(function(el) { el.remove(); });
    gridEl.querySelectorAll('.on-path').forEach(function(el) { el.classList.remove('on-path'); });
  }

  function visualizePath(pathData) {
    clearPathVisualization();

    var cells = gridEl.querySelectorAll('.grid-cell');
    var cellGrid = [];
    for (var r = 0; r < ROWS; r++) { cellGrid[r] = []; }
    cells.forEach(function(cell) {
      var row = parseInt(cell.dataset.row);
      var col = parseInt(cell.dataset.col);
      cellGrid[row][col] = cell;
    });

    pathData.visited.forEach(function(pos, i) {
      var cell = cellGrid[pos.r][pos.c];
      if (!cell) return;
      cell.classList.add('on-path');

      var marker = document.createElement('div');
      marker.className = 'step-marker';
      marker.textContent = i;

      if (i === pathData.visited.length - 1) {
        var ct = getCellType(pos.r, pos.c);
        if (ct === CELL_GOAL) marker.classList.add('terminal-goal');
        if (ct === CELL_VOLCANO) marker.classList.add('terminal-volcano');
        if (ct === CELL_SMALL_REWARD) marker.classList.add('terminal-small-reward');
      }

      if (i > 0 && pathData.slipped[i - 1]) {
        marker.classList.add('step-slipped');
      }

      var angle = (i * 137.508) * Math.PI / 180;
      var radius = Math.min(15, 5 + i * 2);
      var offsetX = 50 + Math.cos(angle) * radius;
      var offsetY = 50 + Math.sin(angle) * radius;
      marker.style.top = offsetY + '%';
      marker.style.left = offsetX + '%';
      marker.style.transform = 'translate(-50%, -50%) scale(0)';

      cell.appendChild(marker);
      (function(m, idx) {
        setTimeout(function() {
          m.classList.add('visible');
          m.style.transform = 'translate(-50%, -50%) scale(1)';
        }, idx * 50);
      })(marker, i);
    });
  }

  // ============ PATH LOG ENTRY ============
  function createPathEntry(pathData, index, isLatest) {
    var entry = document.createElement('div');
    entry.className = 'path-entry' + (isLatest ? ' latest' : '');

    var utilityClass = pathData.utility >= 0 ? 'positive' : 'negative';

    var tableRows = '';
    for (var i = 0; i < pathData.actions.length; i++) {
      var actionLetter = DIR_LETTERS[pathData.actions[i]];
      var reward = pathData.rewards[i];
      var rewardStr;
      if (Number.isInteger(reward)) {
        rewardStr = reward.toString();
      } else {
        rewardStr = reward.toFixed(1);
      }
      var nextState = pathData.visited[i + 1];
      var nextStateStr = '(' + (nextState.r + 1) + ',' + (nextState.c + 1) + ')';
      var rowClass = '';
      if (i === pathData.actions.length - 1) {
        if (reward > 1) rowClass = ' class="ars-positive"';
        else if (reward < -1) rowClass = ' class="ars-negative"';
      }
      tableRows += '<tr' + rowClass + '><td>' + actionLetter + '</td><td>' + rewardStr + '</td><td>' + nextStateStr + '</td></tr>';
    }

    entry.innerHTML =
      '<div class="path-entry-header">' +
        '<span class="path-number">Episode #' + index + '</span>' +
        '<span class="path-utility ' + utilityClass + '">Utility: ' + pathData.utility.toFixed(2) + '</span>' +
      '</div>' +
      '<table class="ars-table">' +
        '<thead><tr><th>a</th><th>r</th><th>s\'</th></tr></thead>' +
        '<tbody>' + tableRows + '</tbody>' +
      '</table>';

    return entry;
  }

  // ============ SAMPLE EPISODES ============
  function doSample(count) {
    var state = tabState[activeTab];
    var lastPath;
    var fragment = document.createDocumentFragment();
    var emptyEl = document.getElementById('path-log-empty');
    if (emptyEl) emptyEl.style.display = 'none';

    var prev = pathLogEl.querySelector('.path-entry.latest');
    if (prev) prev.classList.remove('latest');

    for (var i = 0; i < count; i++) {
      var p;
      if (activeTab === 'model-based') {
        p = sampleEpisodeModelBased();
        updateVValues(p);
      } else if (activeTab === 'model-free') {
        p = sampleEpisodeModelFree();
        updateQValues(p);
      } else if (activeTab === 'sarsa') {
        p = sampleEpisodeSARSA();
        // TD update happens inside sampleEpisodeSARSA
      } else {
        p = sampleEpisodeQLearning();
        // TD update happens inside sampleEpisodeQLearning
      }
      discoverCells(p);
      if (activeTab === 'model-based') {
        discoverParams(p);
      }

      state.paths.push(p);
      state.totalUtility += p.utility;
      lastPath = p;

      if (count <= 50 || i >= count - 50) {
        var entry = createPathEntry(p, state.paths.length, i === count - 1);
        fragment.insertBefore(entry, fragment.firstChild);
      }
    }

    if (count > 50) {
      var summaryDiv = document.createElement('div');
      summaryDiv.className = 'path-entry';
      summaryDiv.innerHTML = '<div class="path-entry-header"><span class="path-number" style="color:var(--color-text-faint)">\u2026 ' + (count - 50) + ' more episodes above</span></div>';
      fragment.appendChild(summaryDiv);
    }

    pathLogEl.insertBefore(fragment, pathLogEl.firstChild);
    updateStats();
    if (activeTab === 'model-based') {
      updateParamDisplay();
    }
    updateTDEpsilonDisplay();
    if (lastPath) visualizePath(lastPath);
    buildGrid();
  }

  // ============ RESET ============
  function resetSamples() {
    tabState[activeTab] = freshTabState();
    updateStats();
    updateParamDisplay();
    updateTDEpsilonDisplay();
    clearPathVisualization();
    buildGrid();

    pathLogEl.innerHTML = '';
    var empty = document.createElement('div');
    empty.className = 'path-log-empty';
    empty.id = 'path-log-empty';
    empty.innerHTML = 'No episodes sampled yet. Click <strong>Sample 1 Episode</strong> to begin.';
    pathLogEl.appendChild(empty);
  }

  // ============ TAB SWITCHING ============
  function switchTab(tab) {
    activeTab = tab;

    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    gridLegend.style.display = 'none';

    // Show correct exploration panel
    var isTD = TD_TABS.indexOf(tab) !== -1;
    var isMFMC = (tab === 'model-free');
    explorationGroup.style.display = isMFMC ? 'block' : 'none';
    explorationGroupTD.style.display = isTD ? 'block' : 'none';

    // Show correct action buttons
    document.getElementById('actions-mc').style.display = isTD ? 'none' : 'flex';
    document.getElementById('actions-td').style.display = isTD ? 'flex' : 'none';

    // Show learning rate only for TD methods
    lrRow.style.display = isTD ? 'grid' : 'none';
    lrHint.style.display = isTD ? 'block' : 'none';

    // Show/hide learned column — only for model-based
    var learnedEls = document.querySelectorAll('.learned-col');
    var showLearned = (tab === 'model-based');
    for (var li = 0; li < learnedEls.length; li++) {
      learnedEls[li].style.display = showLearned ? '' : 'none';
    }
    paramHeaderRow.classList.toggle('no-learned', !showLearned);

    // Update TD epsilon display
    if (isTD) updateTDEpsilonDisplay();

    // Update V(start) label
    var statLabel = document.querySelector('.stat-label-value');
    if (statLabel) {
      statLabel.textContent = (tab === 'model-based') ? 'V(start)' : 'max Q(start,a)';
    }

    updateEduPanel();
    buildGrid();
    rebuildPathLog();
    updateStats();
    updateParamDisplay();
  }

  function updateEduPanel() {
    var content = EDU_CONTENT[activeTab];
    eduPanelEl.innerHTML =
      '<h3>' + content.title + '</h3>' +
      '<p>' + content.description + '</p>' +
      '<div class="edu-formula">' + content.formula + '</div>' +
      '<p class="edu-diff">' + content.diff + '</p>';
  }

  function rebuildPathLog() {
    var state = tabState[activeTab];
    pathLogEl.innerHTML = '';

    if (state.paths.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'path-log-empty';
      empty.id = 'path-log-empty';
      empty.innerHTML = 'No episodes sampled yet. Click <strong>Sample 1 Episode</strong> to begin.';
      pathLogEl.appendChild(empty);
      clearPathVisualization();
      return;
    }

    var showCount = Math.min(state.paths.length, 50);
    var startIdx = state.paths.length - showCount;
    var fragment = document.createDocumentFragment();

    for (var i = state.paths.length - 1; i >= startIdx; i--) {
      var isLatest = (i === state.paths.length - 1);
      var entry = createPathEntry(state.paths[i], i + 1, isLatest);
      fragment.appendChild(entry);
    }

    if (state.paths.length > 50) {
      var summaryDiv = document.createElement('div');
      summaryDiv.className = 'path-entry';
      summaryDiv.innerHTML = '<div class="path-entry-header"><span class="path-number" style="color:var(--color-text-faint)">\u2026 ' + (state.paths.length - 50) + ' more episodes</span></div>';
      fragment.appendChild(summaryDiv);
    }

    pathLogEl.appendChild(fragment);
    visualizePath(state.paths[state.paths.length - 1]);
  }

  // ============ PARAM CHANGE ============
  function onParamChange() {
    buildGrid();
  }

  // ============ THEME TOGGLE ============
  (function () {
    var toggle = document.querySelector('[data-theme-toggle]');
    var root = document.documentElement;
    var theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);

    if (toggle) {
      toggle.addEventListener('click', function() {
        theme = theme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', theme);
        toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
        toggle.innerHTML = theme === 'dark'
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      });
    }
  })();

  // ============ EPSILON SLIDER (MFMC) ============
  epsilonSlider.addEventListener('input', function() {
    var val = parseFloat(epsilonSlider.value);
    epsilonDisplay.textContent = '\u03B5 = ' + val.toFixed(1);
  });

  // ============ INIT ============
  buildGrid();
  updateEduPanel();
  updateParamDisplay();
  switchTab('model-based');

  document.getElementById('btn-sample').addEventListener('click', function() { doSample(1); });
  document.getElementById('btn-sample1000').addEventListener('click', function() { doSample(1000); });
  document.getElementById('btn-reset-mc').addEventListener('click', resetSamples);

  // TD: Run all episodes at once, then reset
  document.getElementById('btn-run-td').addEventListener('click', function() {
    resetSamples();
    var n = parseInt(document.getElementById('td-num-episodes').value) || 10000;
    doSample(n);
  });
  document.getElementById('btn-reset-td').addEventListener('click', resetSamples);

  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      switchTab(btn.dataset.tab);
    });
  });

  ['moveReward', 'passReward', 'smallReward', 'volcanoReward', 'slipProb', 'discount', 'learningRate'].forEach(function(id) {
    document.getElementById(id).addEventListener('change', onParamChange);
  });

  // Epsilon decay inputs
  ['eps-init', 'eps-decay', 'eps-min'].forEach(function(id) {
    document.getElementById(id).addEventListener('change', updateTDEpsilonDisplay);
    document.getElementById(id).addEventListener('input', updateTDEpsilonDisplay);
  });

})();
