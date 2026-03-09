/* app.js — Tabular Q-Learning vs Feature-Based Q-Learning on 5x7 Volcano Grid */
(function () {
  'use strict';

  // ============ GRID DEFINITION ============
  var ROWS = 5;
  var COLS = 7;

  var CELL_NORMAL = 'normal';
  var CELL_GOAL = 'goal';
  var CELL_VOLCANO = 'volcano';
  var CELL_START = 'start';
  var CELL_SMALL_REWARD = 'small_reward';

  // 0-indexed internally: row 0-4, col 0-6
  // 1-indexed for display: row 1-5, col 1-7
  function getCellType(r, c) {
    // Goal: (1,7) => (0,6)
    if (r === 0 && c === 6) return CELL_GOAL;
    // Volcanoes: (1,6),(2,6),(3,6),(4,6) => (0,5),(1,5),(2,5),(3,5)
    if (c === 5 && r >= 0 && r <= 3) return CELL_VOLCANO;
    // Small reward / Start: (5,1) => (4,0)
    if (r === 4 && c === 0) return CELL_SMALL_REWARD;
    return CELL_NORMAL;
  }

  // Start position: (5,1) => (4,0)
  var START_R = 4;
  var START_C = 0;

  function isTerminal(r, c) {
    var t = getCellType(r, c);
    return t === CELL_GOAL || t === CELL_VOLCANO;
  }

  // Check if arriving at (r,c) ends the episode
  // The small_reward at start ends the episode only if agent came from elsewhere
  function isTerminalArrival(r, c, fromR, fromC) {
    if (isTerminal(r, c)) return true;
    // Arriving back at small_reward/start from a different cell
    if (getCellType(r, c) === CELL_SMALL_REWARD && (r !== fromR || c !== fromC)) return true;
    return false;
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

  // All tab ids
  var ALL_TABS = ['tabular', 'feature'];

  // Number of features for feature-based
  var NUM_FEATURES = 16;
  var FEATURE_LABELS = [
    '1[a=N]', '1[a=S]', '1[a=W]', '1[a=E]',
    '1[row=1]', '1[row=2]', '1[row=3]', '1[row=4]', '1[row=5]',
    '1[col=1]', '1[col=2]', '1[col=3]', '1[col=4]', '1[col=5]', '1[col=6]', '1[col=7]'
  ];

  // ============ SHARED STATE ============
  function freshTabState() {
    var qValues = {};
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        qValues[r + ',' + c] = [0, 0, 0, 0];
      }
    }
    // Weight vector for feature-based (16 weights initialized to 0)
    var weights = [];
    for (var i = 0; i < NUM_FEATURES; i++) {
      weights.push(0);
    }
    return {
      paths: [],
      totalUtility: 0,
      qValues: qValues,
      weights: weights,
      discovered: {},
      episodeCount: 0
    };
  }

  var tabState = {};
  for (var ti = 0; ti < ALL_TABS.length; ti++) {
    tabState[ALL_TABS[ti]] = freshTabState();
  }

  var activeTab = 'tabular';

  // ============ DOM REFS ============
  var gridEl = document.getElementById('grid-world');
  var pathLogEl = document.getElementById('path-log');
  var statSamplesEl = document.getElementById('stat-samples');
  var statAvgUtilityEl = document.getElementById('stat-avg-utility');
  var statValueEl = document.getElementById('stat-value');
  var eduPanelEl = document.getElementById('edu-panel');
  var qTableContainer = document.getElementById('q-table-container');
  var qTableBody = document.getElementById('q-table-body');
  var wTableContainer = document.getElementById('w-table-container');
  var wTableBody = document.getElementById('w-table-body');

  // ============ EDUCATIONAL CONTENT ============
  var EDU_CONTENT = {
    'tabular': {
      title: 'Tabular Q-Learning',
      description: 'Standard Q-learning stores a separate value Q(s,a) for every state-action pair. With 35 states and 4 actions, that\'s 140 entries. Each entry is updated independently using observed transitions. This is exact but doesn\'t generalize \u2014 learning about one state tells nothing about similar states.',
      formula: 'Q(s,a) \u2190 (1\u2212\u03B7) Q(s,a) + \u03B7 (r + \u03B3 max_a\' Q(s\',a\'))',
      diff: 'Exact representation: 140 independent parameters. Converges to Q* but requires visiting every (s,a) pair many times.'
    },
    'feature': {
      title: 'Feature-Based Q-Learning (Linear Approximation)',
      description: 'Instead of a table, Q\u0302(s,a) = w \u00b7 \u03C6(s,a) where \u03C6 is a 16-dimensional binary feature vector encoding action indicators (4) and position indicators (5 rows + 7 cols). Only 16 weights are learned instead of 140 entries. This enables generalization: updating for one state affects predictions for states sharing features.',
      formula: 'w \u2190 w + \u03B7 \u00b7 (r + \u03B3 max_a\' Q\u0302(s\',a\') \u2212 Q\u0302(s,a)) \u00b7 \u03C6(s,a)',
      diff: 'Compact: only 16 weights vs 140 Q-entries. Generalizes across states, but introduces approximation error \u2014 the true Q* may not be representable as a linear function of these features.'
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
      passReward:    readNum('passReward', 20),
      volcanoReward: readNum('volcanoReward', -50),
      smallReward:   readNum('smallReward', 2),
      slipProb:      Math.min(1, Math.max(0, readNum('slipProb', 0.1))),
      discount:      Math.min(1, Math.max(0, readNum('discount', 0.9))),
      learningRate:  Math.min(1, Math.max(0.001, readNum('learningRate', 0.01)))
    };
  }

  // Get epsilon based on exponential decay
  function getTDEpsilon(episodeNum) {
    var epsInit = parseFloat(document.getElementById('eps-init').value);
    var decay = parseFloat(document.getElementById('eps-decay').value);
    var epsMin = parseFloat(document.getElementById('eps-min').value);
    if (Number.isNaN(epsInit)) epsInit = 1.0;
    if (Number.isNaN(decay)) decay = 0.9995;
    if (Number.isNaN(epsMin)) epsMin = 0.01;

    var eps = Math.max(epsInit * Math.pow(decay, episodeNum), epsMin);
    return eps;
  }

  function updateTDEpsilonDisplay() {
    var state = tabState[activeTab];
    var numEps = state.episodeCount;
    var eps = getTDEpsilon(numEps);
    var valEl = document.getElementById('eps-current-val');
    var stageEl = document.getElementById('eps-current-stage');
    if (valEl) valEl.textContent = eps.toFixed(4);
    if (stageEl) stageEl.textContent = 'Episode ' + numEps;
  }

  // ============ FEATURE VECTOR ============
  // Returns a 16-element array of 0/1
  // dir: 'up','down','left','right' (action index 0-3)
  // r,c: 0-indexed row/col
  function featureVector(r, c, dirIndex) {
    var phi = [];
    // Action indicators (4 features)
    for (var a = 0; a < 4; a++) {
      phi.push(dirIndex === a ? 1 : 0);
    }
    // Row indicators (5 features): rows 0-4 map to features 4-8
    for (var row = 0; row < ROWS; row++) {
      phi.push(r === row ? 1 : 0);
    }
    // Col indicators (7 features): cols 0-6 map to features 9-15
    for (var col = 0; col < COLS; col++) {
      phi.push(c === col ? 1 : 0);
    }
    return phi;
  }

  // Dot product of weights and feature vector
  function dotProduct(w, phi) {
    var sum = 0;
    for (var i = 0; i < w.length; i++) {
      sum += w[i] * phi[i];
    }
    return sum;
  }

  // Compute Q-hat(s,a) for feature-based
  function featureQ(weights, r, c, dirIndex) {
    var phi = featureVector(r, c, dirIndex);
    return dotProduct(weights, phi);
  }

  // ============ EPSILON-GREEDY ACTION ============
  function chooseEpsilonGreedy(r, c, tabId, epsilon) {
    if (Math.random() < epsilon) {
      return Math.floor(Math.random() * 4);
    }

    var state = tabState[tabId];
    var bestVal = -Infinity;
    var bestActions = [];

    if (tabId === 'tabular') {
      var key = r + ',' + c;
      var qv = state.qValues[key];
      for (var a = 0; a < 4; a++) {
        if (qv[a] > bestVal) {
          bestVal = qv[a];
          bestActions = [a];
        } else if (qv[a] === bestVal) {
          bestActions.push(a);
        }
      }
    } else {
      // Feature-based
      for (var a2 = 0; a2 < 4; a2++) {
        var qVal = featureQ(state.weights, r, c, a2);
        if (qVal > bestVal) {
          bestVal = qVal;
          bestActions = [a2];
        } else if (qVal === bestVal) {
          bestActions.push(a2);
        }
      }
    }

    return bestActions[Math.floor(Math.random() * bestActions.length)];
  }

  // ============ ENVIRONMENT STEP ============
  function envStep(r, c, actionIndex, params) {
    var actual = actionIndex;
    var wasSlip = false;
    if (Math.random() < params.slipProb) {
      actual = Math.floor(Math.random() * 4);
      wasSlip = true;
    }

    var dirName = DIR_NAMES[actual];
    var delta = DIRS[dirName];
    var nr = r + delta[0];
    var nc = c + delta[1];
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) { nr = r; nc = c; }

    var reward;
    var done = false;
    var tt = getCellType(nr, nc);

    if (tt === CELL_GOAL) {
      done = true;
      reward = params.moveReward + params.passReward;
    } else if (tt === CELL_VOLCANO) {
      done = true;
      reward = params.moveReward + params.volcanoReward;
    } else if (tt === CELL_SMALL_REWARD && (nr !== r || nc !== c)) {
      // Small reward only when arriving from a DIFFERENT cell
      done = true;
      reward = params.moveReward + params.smallReward;
    } else {
      reward = params.moveReward;
    }

    return { nr: nr, nc: nc, reward: reward, done: done, wasSlip: wasSlip, actualAction: actual };
  }

  // ============ RUN SINGLE EPISODE (TABULAR Q-LEARNING) ============
  function runTabularEpisode(params, epsilon, maxSteps) {
    var state = tabState['tabular'];
    var r = START_R;
    var c = START_C;
    var steps = [];
    var totalReward = 0;
    var visited = [{ r: r, c: c }];

    state.discovered[r + ',' + c] = true;

    for (var step = 0; step < maxSteps; step++) {
      var actionIndex = chooseEpsilonGreedy(r, c, 'tabular', epsilon);
      var result = envStep(r, c, actionIndex, params);
      var key = r + ',' + c;

      // Q-learning update: Q(s,a) <- (1-lr)*Q(s,a) + lr*(r + gamma * max_a' Q(s',a'))
      var maxNextQ = -Infinity;
      if (result.done) {
        maxNextQ = 0;
      } else {
        var nextKey = result.nr + ',' + result.nc;
        var nextQv = state.qValues[nextKey];
        for (var a = 0; a < 4; a++) {
          if (nextQv[a] > maxNextQ) maxNextQ = nextQv[a];
        }
      }

      var target = result.reward + params.discount * maxNextQ;
      var lr = params.learningRate;
      state.qValues[key][actionIndex] = (1 - lr) * state.qValues[key][actionIndex] + lr * target;

      steps.push({
        action: DIR_LETTERS[DIR_NAMES[actionIndex]],
        reward: result.reward,
        nextState: '(' + (result.nr + 1) + ',' + (result.nc + 1) + ')',
        wasSlip: result.wasSlip
      });

      totalReward += result.reward;
      r = result.nr;
      c = result.nc;
      visited.push({ r: r, c: c });
      state.discovered[r + ',' + c] = true;

      if (result.done) break;
    }

    return { steps: steps, totalReward: totalReward, visited: visited };
  }

  // ============ RUN SINGLE EPISODE (FEATURE-BASED Q-LEARNING) ============
  function runFeatureEpisode(params, epsilon, maxSteps) {
    var state = tabState['feature'];
    var r = START_R;
    var c = START_C;
    var steps = [];
    var totalReward = 0;
    var visited = [{ r: r, c: c }];
    var w = state.weights;

    state.discovered[r + ',' + c] = true;

    for (var step = 0; step < maxSteps; step++) {
      var actionIndex = chooseEpsilonGreedy(r, c, 'feature', epsilon);
      var result = envStep(r, c, actionIndex, params);

      // Compute Q-hat(s,a)
      var phi = featureVector(r, c, actionIndex);
      var qCurrent = dotProduct(w, phi);

      // Compute max_a' Q-hat(s', a')
      var maxNextQ = -Infinity;
      if (result.done) {
        maxNextQ = 0;
      } else {
        for (var a = 0; a < 4; a++) {
          var qNext = featureQ(w, result.nr, result.nc, a);
          if (qNext > maxNextQ) maxNextQ = qNext;
        }
      }

      // Semi-gradient update: w <- w + lr * (target - Q_hat) * phi
      var target = result.reward + params.discount * maxNextQ;
      var td_error = target - qCurrent;
      var lr = params.learningRate;
      for (var i = 0; i < NUM_FEATURES; i++) {
        w[i] += lr * td_error * phi[i];
      }

      steps.push({
        action: DIR_LETTERS[DIR_NAMES[actionIndex]],
        reward: result.reward,
        nextState: '(' + (result.nr + 1) + ',' + (result.nc + 1) + ')',
        wasSlip: result.wasSlip
      });

      totalReward += result.reward;
      r = result.nr;
      c = result.nc;
      visited.push({ r: r, c: c });
      state.discovered[r + ',' + c] = true;

      if (result.done) break;
    }

    return { steps: steps, totalReward: totalReward, visited: visited };
  }

  // ============ BUILD GRID ============
  function buildGrid() {
    gridEl.innerHTML = '';
    var state = tabState[activeTab];

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

          // Show best Q-action arrow (non-terminal only)
          if (!isTerminal(r, c)) {
            var bestDir = getBestQAction(r, c, activeTab);
            if (bestDir !== null) {
              var qArrow = document.createElement('span');
              qArrow.className = 'cell-q-arrow';
              qArrow.textContent = DIR_ARROWS[bestDir];
              cell.appendChild(qArrow);
            }
          }

          // Show START badge
          if (r === START_R && c === START_C) {
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

  // Get the best action from Q-table or feature weights
  function getBestQAction(r, c, tabId) {
    var state = tabState[tabId];
    var bestVal = -Infinity;
    var bestDir = null;

    if (tabId === 'tabular') {
      var key = r + ',' + c;
      var qv = state.qValues[key];
      var anyNonZero = false;
      for (var a = 0; a < 4; a++) {
        if (qv[a] !== 0) anyNonZero = true;
        if (qv[a] > bestVal) {
          bestVal = qv[a];
          bestDir = DIR_NAMES[a];
        }
      }
      return anyNonZero ? bestDir : null;
    } else {
      // Feature-based
      var anyNonZeroW = false;
      for (var w = 0; w < NUM_FEATURES; w++) {
        if (state.weights[w] !== 0) { anyNonZeroW = true; break; }
      }
      if (!anyNonZeroW) return null;

      for (var a2 = 0; a2 < 4; a2++) {
        var qVal = featureQ(state.weights, r, c, a2);
        if (qVal > bestVal) {
          bestVal = qVal;
          bestDir = DIR_NAMES[a2];
        }
      }
      return bestDir;
    }
  }

  // ============ BUILD Q-TABLE (TABULAR) ============
  function buildQTable() {
    qTableBody.innerHTML = '';
    var state = tabState['tabular'];

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

        // Find best action
        var bestA = -1;
        var bestVal = -Infinity;
        var qv = state.qValues[key];
        var anyNonZero = false;
        for (var a = 0; a < 4; a++) {
          if (qv[a] !== 0) anyNonZero = true;
          if (qv[a] > bestVal) { bestVal = qv[a]; bestA = a; }
        }
        if (!anyNonZero) bestA = -1;

        // Q-value cells
        for (var a2 = 0; a2 < 4; a2++) {
          var td = document.createElement('td');
          td.className = 'q-value-cell';
          var val = qv[a2];

          if (isTerminal(r, c)) {
            td.textContent = '\u00b7';
            td.classList.add('q-terminal');
          } else if (val === 0 && !anyNonZero) {
            td.textContent = '0.00';
            td.classList.add('q-empty');
          } else {
            td.textContent = val.toFixed(2);
            if (val > 0.01) td.classList.add('q-positive');
            else if (val < -0.01) td.classList.add('q-negative');
            if (a2 === bestA) td.classList.add('q-best');
          }

          row.appendChild(td);
        }

        qTableBody.appendChild(row);
      }
    }
  }

  // ============ BUILD WEIGHT TABLE (FEATURE-BASED) ============
  function buildWeightTable() {
    wTableBody.innerHTML = '';
    var state = tabState['feature'];

    for (var i = 0; i < NUM_FEATURES; i++) {
      var row = document.createElement('tr');

      var featureCell = document.createElement('td');
      featureCell.className = 'w-feature-cell';
      featureCell.textContent = FEATURE_LABELS[i];
      row.appendChild(featureCell);

      var weightCell = document.createElement('td');
      weightCell.className = 'w-weight-cell';
      var val = state.weights[i];
      weightCell.textContent = val.toFixed(4);
      if (val > 0.001) weightCell.classList.add('w-positive');
      else if (val < -0.001) weightCell.classList.add('w-negative');
      row.appendChild(weightCell);

      wTableBody.appendChild(row);
    }
  }

  // ============ UPDATE STATS ============
  function updateStats() {
    var state = tabState[activeTab];
    var numEps = state.episodeCount;

    statSamplesEl.textContent = numEps;

    if (numEps > 0) {
      var avg = state.totalUtility / numEps;
      statAvgUtilityEl.textContent = avg.toFixed(2);
      var cls = avg >= 0 ? 'positive' : 'negative';
      statAvgUtilityEl.style.color = avg >= 0.01 ? 'var(--color-goal)' : (avg < -0.01 ? 'var(--color-volcano)' : '');
    } else {
      statAvgUtilityEl.innerHTML = '&mdash;';
      statAvgUtilityEl.style.color = '';
    }

    // max Q(start, a)
    var maxQ = getMaxQStart();
    if (maxQ !== null) {
      statValueEl.textContent = maxQ.toFixed(2);
    } else {
      statValueEl.innerHTML = '&mdash;';
    }
  }

  function getMaxQStart() {
    var state = tabState[activeTab];
    var maxVal = -Infinity;
    var anyNonZero = false;

    if (activeTab === 'tabular') {
      var key = START_R + ',' + START_C;
      var qv = state.qValues[key];
      for (var a = 0; a < 4; a++) {
        if (qv[a] !== 0) anyNonZero = true;
        if (qv[a] > maxVal) maxVal = qv[a];
      }
    } else {
      for (var a2 = 0; a2 < 4; a2++) {
        var qVal = featureQ(state.weights, START_R, START_C, a2);
        if (qVal !== 0) anyNonZero = true;
        if (qVal > maxVal) maxVal = qVal;
      }
    }

    return anyNonZero ? maxVal : null;
  }

  // ============ RENDER EDUCATIONAL PANEL ============
  function renderEduPanel() {
    var content = EDU_CONTENT[activeTab];
    eduPanelEl.innerHTML = '<h3>' + content.title + '</h3>' +
      '<p>' + content.description + '</p>' +
      '<div class="edu-formula">' + content.formula + '</div>' +
      '<p class="edu-diff">' + content.diff + '</p>';
  }

  // ============ RENDER PATH LOG ============
  function renderPathLog() {
    var state = tabState[activeTab];
    var paths = state.paths;

    if (paths.length === 0) {
      pathLogEl.innerHTML = '<div class="path-log-empty" id="path-log-empty">No episodes sampled yet. Click <strong>Train</strong> to begin.</div>';
      return;
    }

    pathLogEl.innerHTML = '';
    // Show last 10 episodes
    var start = Math.max(0, paths.length - 10);
    for (var i = paths.length - 1; i >= start; i--) {
      var ep = paths[i];
      var entry = document.createElement('div');
      entry.className = 'path-entry';
      if (i === paths.length - 1) entry.classList.add('latest');

      var utilClass = ep.totalReward >= 0 ? 'positive' : 'negative';

      var headerHtml = '<div class="path-entry-header">' +
        '<span class="path-number">Episode ' + (i + 1) + '</span>' +
        '<span class="path-utility ' + utilClass + '">U = ' + ep.totalReward.toFixed(2) + '</span>' +
        '</div>';

      // Build (a, r, s') table — show max 8 steps
      var stepsToShow = Math.min(ep.steps.length, 8);
      var tableHtml = '<table class="ars-table"><thead><tr><th>a</th><th>r</th><th>s\'</th></tr></thead><tbody>';
      for (var j = 0; j < stepsToShow; j++) {
        var s = ep.steps[j];
        var rowClass = '';
        if (s.reward > 5) rowClass = ' class="ars-positive"';
        else if (s.reward < -5) rowClass = ' class="ars-negative"';
        tableHtml += '<tr' + rowClass + '><td>' + s.action + (s.wasSlip ? ' *' : '') + '</td><td>' + s.reward.toFixed(1) + '</td><td>' + s.nextState + '</td></tr>';
      }
      if (ep.steps.length > stepsToShow) {
        tableHtml += '<tr><td colspan="3" style="color:var(--color-text-faint);font-style:italic">... ' + (ep.steps.length - stepsToShow) + ' more steps</td></tr>';
      }
      tableHtml += '</tbody></table>';

      entry.innerHTML = headerHtml + tableHtml;
      pathLogEl.appendChild(entry);
    }
  }

  // ============ RESET ============
  function resetSamples() {
    tabState[activeTab] = freshTabState();
    buildGrid();
    if (activeTab === 'tabular') {
      buildQTable();
    } else {
      buildWeightTable();
    }
    updateStats();
    renderPathLog();
    updateTDEpsilonDisplay();
  }

  // ============ TRAIN ============
  function runTraining() {
    // Reset first
    tabState[activeTab] = freshTabState();

    var numEpisodes = parseInt(document.getElementById('td-num-episodes').value, 10) || 10000;
    var maxSteps = parseInt(document.getElementById('td-max-steps').value, 10) || 100;
    var params = getParams();
    var state = tabState[activeTab];

    // Keep only last 10 episodes in paths for display
    var recentPaths = [];

    for (var ep = 0; ep < numEpisodes; ep++) {
      var epsilon = getTDEpsilon(ep);
      var result;

      if (activeTab === 'tabular') {
        result = runTabularEpisode(params, epsilon, maxSteps);
      } else {
        result = runFeatureEpisode(params, epsilon, maxSteps);
      }

      state.totalUtility += result.totalReward;
      state.episodeCount = ep + 1;

      recentPaths.push({
        steps: result.steps,
        totalReward: result.totalReward
      });
      if (recentPaths.length > 10) {
        recentPaths.shift();
      }
    }

    state.paths = recentPaths;

    // Update all UI
    buildGrid();
    if (activeTab === 'tabular') {
      buildQTable();
    } else {
      buildWeightTable();
    }
    updateStats();
    renderPathLog();
    updateTDEpsilonDisplay();
  }

  // ============ TAB SWITCHING ============
  function switchTab(tabId) {
    activeTab = tabId;

    // Update tab buttons
    var tabs = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].dataset.tab === tabId) {
        tabs[i].classList.add('active');
      } else {
        tabs[i].classList.remove('active');
      }
    }

    // Show/hide Q-table vs weight table
    if (tabId === 'tabular') {
      qTableContainer.style.display = '';
      wTableContainer.style.display = 'none';
      buildQTable();
    } else {
      qTableContainer.style.display = 'none';
      wTableContainer.style.display = '';
      buildWeightTable();
    }

    buildGrid();
    updateStats();
    renderPathLog();
    renderEduPanel();
    updateTDEpsilonDisplay();
  }

  // ============ THEME TOGGLE ============
  function initTheme() {
    var btn = document.querySelector('[data-theme-toggle]');
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next;
      if (current === 'dark') {
        next = 'light';
      } else if (current === 'light') {
        next = 'dark';
      } else {
        // No explicit theme set — check system preference
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        next = prefersDark ? 'light' : 'dark';
      }
      document.documentElement.setAttribute('data-theme', next);
    });
  }

  // ============ INIT ============
  function init() {
    initTheme();

    // Tab buttons
    var tabBtns = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < tabBtns.length; i++) {
      tabBtns[i].addEventListener('click', function () {
        switchTab(this.dataset.tab);
      });
    }

    // Train button
    document.getElementById('btn-run-td').addEventListener('click', function () {
      runTraining();
    });

    // Reset button
    document.getElementById('btn-reset-td').addEventListener('click', function () {
      resetSamples();
    });

    // Initial render
    buildGrid();
    buildQTable();
    updateStats();
    renderPathLog();
    renderEduPanel();
    updateTDEpsilonDisplay();
  }

  init();
})();
