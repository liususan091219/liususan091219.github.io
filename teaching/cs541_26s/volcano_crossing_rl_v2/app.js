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
    if (r === 0 && c === 6) return CELL_GOAL;           // (1,7)
    if (c === 5 && r >= 0 && r <= 3) return CELL_VOLCANO; // (1-4,6)
    if (r === 4 && c === 0) return CELL_SMALL_REWARD;    // (5,1)
    if (r === 3 && c === 0) return CELL_START;           // (4,1)
    return CELL_NORMAL;
  }

  var START_R = 3;
  var START_C = 0;

  function isTerminal(r, c) {
    var t = getCellType(r, c);
    return t === CELL_GOAL || t === CELL_VOLCANO || t === CELL_SMALL_REWARD;
  }

  var DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
  var DIR_NAMES = ['up', 'down', 'left', 'right'];
  var DIR_ARROWS = { up: '\u25B2', down: '\u25BC', left: '\u25C4', right: '\u25BA' };
  var DIR_LETTERS = { up: 'N', down: 'S', left: 'W', right: 'E' };

  var ALL_TABS = ['tabular', 'feature'];

  // Feature vector: full hierarchical decoupled features
  // Individual:  1[a=k] (4)  +  1[r=i] (5)  +  1[c=j] (7)         = 16
  // Pairwise:    1[a=k,r=i] (20) + 1[a=k,c=j] (28) + 1[r=i,c=j] (35) = 83
  // Three-way:   1[a=k,r=i,c=j] (4×5×7)                            = 140
  // Total: 16 + 83 + 140 = 239 features
  // Q̂(s,a) = w_a + w_r + w_c + w_{a,r} + w_{a,c} + w_{r,c} + w_{a,r,c}
  // Each (s,a) activates exactly 7 features (one from each group).
  // Lower-order features provide generalization (shared across states/actions);
  // the three-way feature provides cell-specific action precision.
  var NUM_FEATURES = 4 + ROWS + COLS + 4 * ROWS + 4 * COLS + ROWS * COLS + 4 * ROWS * COLS; // 239
  var FEATURE_LABELS = (function () {
    var labels = [];
    var dirLabels = ['N', 'S', 'W', 'E'];
    // Individual: action (4)
    for (var a = 0; a < 4; a++) labels.push('1[a=' + dirLabels[a] + ']');
    // Individual: row (5)
    for (var r = 0; r < ROWS; r++) labels.push('1[r=' + (r + 1) + ']');
    // Individual: col (7)
    for (var c = 0; c < COLS; c++) labels.push('1[c=' + (c + 1) + ']');
    // Pairwise: action × row (20)
    for (var a2 = 0; a2 < 4; a2++) {
      for (var r2 = 0; r2 < ROWS; r2++) {
        labels.push('1[a=' + dirLabels[a2] + ',r=' + (r2 + 1) + ']');
      }
    }
    // Pairwise: action × col (28)
    for (var a3 = 0; a3 < 4; a3++) {
      for (var c2 = 0; c2 < COLS; c2++) {
        labels.push('1[a=' + dirLabels[a3] + ',c=' + (c2 + 1) + ']');
      }
    }
    // Pairwise: row × col (35)
    for (var r3 = 0; r3 < ROWS; r3++) {
      for (var c3 = 0; c3 < COLS; c3++) {
        labels.push('1[r=' + (r3 + 1) + ',c=' + (c3 + 1) + ']');
      }
    }
    // Three-way: action × row × col (140)
    for (var a4 = 0; a4 < 4; a4++) {
      for (var r4 = 0; r4 < ROWS; r4++) {
        for (var c4 = 0; c4 < COLS; c4++) {
          labels.push('1[a=' + dirLabels[a4] + ',r=' + (r4 + 1) + ',c=' + (c4 + 1) + ']');
        }
      }
    }
    return labels;
  })();

  // ============ SHARED STATE ============
  function freshTabState() {
    var qValues = {};
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        qValues[r + ',' + c] = [0, 0, 0, 0];
      }
    }
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
  var featureQTableBody = document.getElementById('feature-q-table-body');

  // ============ EDUCATIONAL CONTENT ============
  var EDU_CONTENT = {
    'tabular': {
      title: 'Tabular Q-Learning',
      description: 'Standard Q-learning stores a separate Q(s,a) for every state\u2013action pair. With 35 states \u00d7 4 actions = 140 entries, each updated independently from observed transitions. Exact but no generalization \u2014 learning about one state says nothing about others.',
      formula: 'Q(s,a) \u2190 (1\u2212\u03B7) Q(s,a) + \u03B7 (r + \u03B3 max_a\' Q(s\',a\'))',
      diff: '140 independent parameters. Converges to Q* given sufficient exploration, but must visit every (s,a) pair many times.'
    },
    'feature': {
      title: 'Feature-Based Q-Learning (Linear Approximation)',
      description: 'Q\u0302(s,a) = w \u00b7 \u03C6(s,a) using hierarchical indicator features: individual 1[a], 1[r], 1[c] (16) + pairwise 1[a,r], 1[a,c], 1[r,c] (83) + three-way 1[a,r,c] (140) = 239 features total. Each (s,a) activates exactly 7 features (one per group). Lower-order features generalize across states/actions; the three-way feature provides cell-specific precision.',
      formula: 'w \u2190 w + \u03B7 \u00b7 (r + \u03B3 max_a\' Q\u0302(s\',a\') \u2212 Q\u0302(s,a)) \u00b7 \u03C6(s,a)',
      diff: '239 weights (more than tabular\u2019s 140), but structured: each Q-value is a sum of 7 weights from different granularity levels. The lower-order weights act as regularization, sharing information across similar states and actions.'
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

  function getTDEpsilon(episodeNum) {
    var epsInit = parseFloat(document.getElementById('eps-init').value);
    var decay = parseFloat(document.getElementById('eps-decay').value);
    var epsMin = parseFloat(document.getElementById('eps-min').value);
    if (Number.isNaN(epsInit)) epsInit = 1.0;
    if (Number.isNaN(decay)) decay = 0.99999;
    if (Number.isNaN(epsMin)) epsMin = 0.01;
    return Math.max(epsInit * Math.pow(decay, episodeNum), epsMin);
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
  // Layout: [0..3] a | [4..8] r | [9..15] c | [16..35] a×r | [36..63] a×c | [64..98] r×c | [99..238] a×r×c
  function featureVector(r, c, dirIndex) {
    var phi = new Array(NUM_FEATURES);
    for (var i = 0; i < NUM_FEATURES; i++) phi[i] = 0;
    phi[dirIndex] = 1;                                          // 1[a]
    phi[4 + r] = 1;                                             // 1[r]
    phi[9 + c] = 1;                                             // 1[c]
    phi[16 + dirIndex * ROWS + r] = 1;                          // 1[a,r]
    phi[36 + dirIndex * COLS + c] = 1;                          // 1[a,c]
    phi[64 + r * COLS + c] = 1;                                 // 1[r,c]
    phi[99 + dirIndex * ROWS * COLS + r * COLS + c] = 1;        // 1[a,r,c]
    return phi;
  }

  function dotProduct(w, phi) {
    var sum = 0;
    for (var i = 0; i < w.length; i++) { sum += w[i] * phi[i]; }
    return sum;
  }

  function featureQ(weights, r, c, dirIndex) {
    return dotProduct(weights, featureVector(r, c, dirIndex));
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
        if (qv[a] > bestVal) { bestVal = qv[a]; bestActions = [a]; }
        else if (qv[a] === bestVal) { bestActions.push(a); }
      }
    } else {
      for (var a2 = 0; a2 < 4; a2++) {
        var qVal = featureQ(state.weights, r, c, a2);
        if (qVal > bestVal) { bestVal = qVal; bestActions = [a2]; }
        else if (qVal === bestVal) { bestActions.push(a2); }
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
      done = true; reward = params.moveReward + params.passReward;
    } else if (tt === CELL_VOLCANO) {
      done = true; reward = params.moveReward + params.volcanoReward;
    } else if (tt === CELL_SMALL_REWARD && (nr !== r || nc !== c)) {
      done = true; reward = params.moveReward + params.smallReward;
    } else {
      reward = params.moveReward;
    }
    return { nr: nr, nc: nc, reward: reward, done: done, wasSlip: wasSlip, actualAction: actual };
  }

  // ============ RUN SINGLE EPISODE (TABULAR Q-LEARNING) ============
  function runTabularEpisode(params, epsilon, maxSteps, recordSteps) {
    var state = tabState['tabular'];
    var r = START_R, c = START_C;
    var steps = recordSteps ? [] : null;
    var totalReward = 0;
    state.discovered[r + ',' + c] = true;

    for (var step = 0; step < maxSteps; step++) {
      var actionIndex = chooseEpsilonGreedy(r, c, 'tabular', epsilon);
      var result = envStep(r, c, actionIndex, params);
      var key = r + ',' + c;

      var maxNextQ = -Infinity;
      if (result.done) { maxNextQ = 0; }
      else {
        var nextQv = state.qValues[result.nr + ',' + result.nc];
        for (var a = 0; a < 4; a++) { if (nextQv[a] > maxNextQ) maxNextQ = nextQv[a]; }
      }

      var target = result.reward + params.discount * maxNextQ;
      var lr = params.learningRate;
      state.qValues[key][actionIndex] = (1 - lr) * state.qValues[key][actionIndex] + lr * target;

      if (steps) {
        steps.push({
          action: DIR_LETTERS[DIR_NAMES[actionIndex]],
          reward: result.reward,
          nextState: '(' + (result.nr + 1) + ',' + (result.nc + 1) + ')',
          wasSlip: result.wasSlip
        });
      }
      totalReward += result.reward;
      r = result.nr; c = result.nc;
      state.discovered[r + ',' + c] = true;
      if (result.done) break;
    }
    return { steps: steps, totalReward: totalReward };
  }

  // ============ RUN SINGLE EPISODE (FEATURE-BASED Q-LEARNING) ============
  function runFeatureEpisode(params, epsilon, maxSteps, recordSteps) {
    var state = tabState['feature'];
    var r = START_R, c = START_C;
    var steps = recordSteps ? [] : null;
    var totalReward = 0;
    var w = state.weights;
    state.discovered[r + ',' + c] = true;

    for (var step = 0; step < maxSteps; step++) {
      var actionIndex = chooseEpsilonGreedy(r, c, 'feature', epsilon);
      var result = envStep(r, c, actionIndex, params);

      var phi = featureVector(r, c, actionIndex);
      var qCurrent = dotProduct(w, phi);

      var maxNextQ = -Infinity;
      if (result.done) { maxNextQ = 0; }
      else {
        for (var a = 0; a < 4; a++) {
          var qNext = featureQ(w, result.nr, result.nc, a);
          if (qNext > maxNextQ) maxNextQ = qNext;
        }
      }

      var target = result.reward + params.discount * maxNextQ;
      var td_error = target - qCurrent;
      var lr = params.learningRate;
      for (var i = 0; i < NUM_FEATURES; i++) {
        w[i] += lr * td_error * phi[i];
      }

      if (steps) {
        steps.push({
          action: DIR_LETTERS[DIR_NAMES[actionIndex]],
          reward: result.reward,
          nextState: '(' + (result.nr + 1) + ',' + (result.nc + 1) + ')',
          wasSlip: result.wasSlip
        });
      }
      totalReward += result.reward;
      r = result.nr; c = result.nc;
      state.discovered[r + ',' + c] = true;
      if (result.done) break;
    }
    return { steps: steps, totalReward: totalReward };
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

          if (!isTerminal(r, c)) {
            var bestDir = getBestQAction(r, c, activeTab);
            if (bestDir !== null) {
              var qArrow = document.createElement('span');
              qArrow.className = 'cell-q-arrow';
              qArrow.textContent = DIR_ARROWS[bestDir];
              cell.appendChild(qArrow);
            }
          }

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
        if (qv[a] > bestVal) { bestVal = qv[a]; bestDir = DIR_NAMES[a]; }
      }
      return anyNonZero ? bestDir : null;
    } else {
      var anyNonZeroW = false;
      for (var wi = 0; wi < state.weights.length; wi++) {
        if (state.weights[wi] !== 0) { anyNonZeroW = true; break; }
      }
      if (!anyNonZeroW) return null;
      for (var a2 = 0; a2 < 4; a2++) {
        var qVal = featureQ(state.weights, r, c, a2);
        if (qVal > bestVal) { bestVal = qVal; bestDir = DIR_NAMES[a2]; }
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

        var stateCell = document.createElement('td');
        stateCell.className = 'q-state-cell';
        stateCell.textContent = '(' + (r + 1) + ',' + (c + 1) + ')';
        if (isTerminal(r, c)) stateCell.classList.add('q-terminal');
        row.appendChild(stateCell);

        var bestA = -1, bestVal = -Infinity;
        var qv = state.qValues[key];
        var anyNonZero = false;
        for (var a = 0; a < 4; a++) {
          if (qv[a] !== 0) anyNonZero = true;
          if (qv[a] > bestVal) { bestVal = qv[a]; bestA = a; }
        }
        if (!anyNonZero) bestA = -1;

        for (var a2 = 0; a2 < 4; a2++) {
          var td = document.createElement('td');
          td.className = 'q-value-cell';
          var val = qv[a2];
          if (isTerminal(r, c)) {
            td.textContent = '\u00b7'; td.classList.add('q-terminal');
          } else if (val === 0 && !anyNonZero) {
            td.textContent = '0.00'; td.classList.add('q-empty');
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

  // ============ BUILD FEATURE Q-TABLE ============
  function buildFeatureQTable() {
    featureQTableBody.innerHTML = '';
    var state = tabState['feature'];
    var w = state.weights;

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var row = document.createElement('tr');

        var stateCell = document.createElement('td');
        stateCell.className = 'q-state-cell';
        stateCell.textContent = '(' + (r + 1) + ',' + (c + 1) + ')';
        if (isTerminal(r, c)) stateCell.classList.add('q-terminal');
        row.appendChild(stateCell);

        var bestA = -1, bestVal = -Infinity, anyNonZero = false;
        var qVals = [];
        for (var a = 0; a < 4; a++) {
          var qVal = featureQ(w, r, c, a);
          qVals.push(qVal);
          if (Math.abs(qVal) > 0.001) anyNonZero = true;
          if (qVal > bestVal) { bestVal = qVal; bestA = a; }
        }
        if (!anyNonZero) bestA = -1;

        for (var a2 = 0; a2 < 4; a2++) {
          var td = document.createElement('td');
          td.className = 'q-value-cell';
          var val = qVals[a2];
          if (isTerminal(r, c)) {
            td.textContent = '\u00b7'; td.classList.add('q-terminal');
          } else if (!anyNonZero) {
            td.textContent = '0.00'; td.classList.add('q-empty');
          } else {
            td.textContent = val.toFixed(2);
            if (val > 0.01) td.classList.add('q-positive');
            else if (val < -0.01) td.classList.add('q-negative');
            if (a2 === bestA) td.classList.add('q-best');
          }
          row.appendChild(td);
        }
        featureQTableBody.appendChild(row);
      }
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
      statAvgUtilityEl.style.color = avg >= 0.01 ? 'var(--color-goal)' : (avg < -0.01 ? 'var(--color-volcano)' : '');
    } else {
      statAvgUtilityEl.innerHTML = '&mdash;';
      statAvgUtilityEl.style.color = '';
    }

    var maxQ = getMaxQStart();
    statValueEl.textContent = maxQ !== null ? maxQ.toFixed(2) : '\u2014';
  }

  function getMaxQStart() {
    var state = tabState[activeTab];
    var maxVal = -Infinity;
    var anyNonZero = false;

    if (activeTab === 'tabular') {
      var qv = state.qValues[START_R + ',' + START_C];
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
    var start = Math.max(0, paths.length - 10);
    for (var i = paths.length - 1; i >= start; i--) {
      var ep = paths[i];
      var entry = document.createElement('div');
      entry.className = 'path-entry';
      if (i === paths.length - 1) entry.classList.add('latest');

      var utilClass = ep.totalReward >= 0 ? 'positive' : 'negative';
      var headerHtml = '<div class="path-entry-header">' +
        '<span class="path-number">Episode ' + (i + 1) + '</span>' +
        '<span class="path-utility ' + utilClass + '">U = ' + ep.totalReward.toFixed(2) + '</span></div>';

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
    if (activeTab === 'tabular') { buildQTable(); }
    else { buildWeightTable(); buildFeatureQTable(); }
    updateStats();
    renderPathLog();
    updateTDEpsilonDisplay();
  }

  // ============ TRAIN ============
  var isTraining = false;

  function setTrainingUI(running) {
    var btn = document.getElementById('btn-run-td');
    var progressEl = document.getElementById('training-progress');
    if (running) {
      btn.disabled = true;
      btn.textContent = 'Training\u2026';
      if (progressEl) progressEl.style.display = 'block';
    } else {
      btn.disabled = false;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l14 9-14 9V3z"/></svg> Train';
      if (progressEl) progressEl.style.display = 'none';
    }
  }

  function updateProgress(current, total) {
    var progressEl = document.getElementById('training-progress');
    if (!progressEl) return;
    var pct = Math.round(100 * current / total);
    progressEl.textContent = 'Episode ' + current.toLocaleString() + ' / ' + total.toLocaleString() + ' (' + pct + '%)';
  }

  function runTraining() {
    if (isTraining) return;
    isTraining = true;

    tabState[activeTab] = freshTabState();
    buildGrid();
    updateStats();
    renderPathLog();

    var numEpisodes = parseInt(document.getElementById('td-num-episodes').value, 10) || 50000;
    var maxSteps = parseInt(document.getElementById('td-max-steps').value, 10) || 200;
    var params = getParams();
    var state = tabState[activeTab];
    var tab = activeTab;
    var recentPaths = [];
    var ep = 0;
    var BUDGET_MS = 40; // yield to browser every ~40ms for smooth UI
    // Only record full step details for the last TAIL episodes to reduce GC
    var TAIL = 10;
    var tailStart = Math.max(0, numEpisodes - TAIL);

    setTrainingUI(true);

    function runChunk() {
      var t0 = performance.now();
      while (ep < numEpisodes && performance.now() - t0 < BUDGET_MS) {
        var epsilon = getTDEpsilon(ep);
        var recordSteps = ep >= tailStart;
        var result = (tab === 'tabular')
          ? runTabularEpisode(params, epsilon, maxSteps, recordSteps)
          : runFeatureEpisode(params, epsilon, maxSteps, recordSteps);

        state.totalUtility += result.totalReward;
        state.episodeCount = ep + 1;
        ep++;

        if (recordSteps) {
          recentPaths.push({ steps: result.steps, totalReward: result.totalReward });
        }
      }

      updateProgress(ep, numEpisodes);

      if (ep < numEpisodes && activeTab === tab) {
        requestAnimationFrame(runChunk);
      } else {
        state.paths = recentPaths;
        buildGrid();
        if (tab === 'tabular') { buildQTable(); }
        else { buildWeightTable(); buildFeatureQTable(); }
        updateStats();
        renderPathLog();
        updateTDEpsilonDisplay();
        isTraining = false;
        setTrainingUI(false);
      }
    }

    requestAnimationFrame(runChunk);
  }

  // ============ PER-TAB DEFAULTS ============
  var TAB_DEFAULTS = {
    'tabular': { learningRate: '0.1', epsDecay: '0.99999', passReward: '40', episodes: '50000' },
    'feature': { learningRate: '0.008', epsDecay: '0.99999', passReward: '40', episodes: '100000' }
  };

  function applyTabDefaults(tabId) {
    var d = TAB_DEFAULTS[tabId];
    if (!d) return;
    document.getElementById('learningRate').value = d.learningRate;
    document.getElementById('eps-decay').value = d.epsDecay;
    document.getElementById('passReward').value = d.passReward;
    document.getElementById('td-num-episodes').value = d.episodes;
  }

  // ============ TAB SWITCHING ============
  function switchTab(tabId) {
    activeTab = tabId;

    var tabs = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].dataset.tab === tabId) { tabs[i].classList.add('active'); }
      else { tabs[i].classList.remove('active'); }
    }

    applyTabDefaults(tabId);

    if (tabId === 'tabular') {
      qTableContainer.style.display = '';
      wTableContainer.style.display = 'none';
      buildQTable();
    } else {
      qTableContainer.style.display = 'none';
      wTableContainer.style.display = '';
      buildWeightTable();
      buildFeatureQTable();
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
      if (current === 'dark') { next = 'light'; }
      else if (current === 'light') { next = 'dark'; }
      else {
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        next = prefersDark ? 'light' : 'dark';
      }
      document.documentElement.setAttribute('data-theme', next);
    });
  }

  // ============ INIT ============
  function init() {
    initTheme();

    var tabBtns = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < tabBtns.length; i++) {
      tabBtns[i].addEventListener('click', function () { switchTab(this.dataset.tab); });
    }

    document.getElementById('btn-run-td').addEventListener('click', function () { runTraining(); });
    document.getElementById('btn-reset-td').addEventListener('click', function () { resetSamples(); });

    buildGrid();
    buildQTable();
    updateStats();
    renderPathLog();
    renderEduPanel();
    updateTDEpsilonDisplay();
  }

  init();
})();
