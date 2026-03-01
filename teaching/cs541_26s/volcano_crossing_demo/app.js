/* app.js — Volcano Crossing Policy Evaluation */
(function () {
  'use strict';

  // ============ GRID DEFINITION ============
  const ROWS = 3;
  const COLS = 4;

  const CELL_NORMAL = 'normal';
  const CELL_GOAL = 'goal';
  const CELL_VOLCANO = 'volcano';
  const CELL_START = 'start';
  const CELL_SMALL_REWARD = 'small_reward';

  function getCellType(r, c) {
    if (r === 0 && c === 3) return CELL_GOAL;
    if (r === 0 && c === 2) return CELL_VOLCANO;
    if (r === 1 && c === 2) return CELL_VOLCANO;
    if (r === 1 && c === 0) return CELL_START;
    if (r === 2 && c === 0) return CELL_SMALL_REWARD;
    return CELL_NORMAL;
  }

  function isTerminal(r, c) {
    const t = getCellType(r, c);
    return t === CELL_GOAL || t === CELL_VOLCANO || t === CELL_SMALL_REWARD;
  }

  function needsPolicy(r, c) {
    const t = getCellType(r, c);
    return t === CELL_NORMAL || t === CELL_START;
  }

  const DIRS = {
    up:    [-1, 0],
    down:  [1, 0],
    left:  [0, -1],
    right: [0, 1]
  };
  const DIR_NAMES = ['up', 'down', 'left', 'right'];
  const DIR_ARROWS = { up: '▲', down: '▼', left: '◄', right: '►' };

  const policy = {};
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (needsPolicy(r, c)) {
        policy[`${r},${c}`] = 'right';
      }
    }
  }

  let paths = [];
  let totalUtility = 0;

  const gridEl = document.getElementById('grid-world');
  const pathLogEl = document.getElementById('path-log');
  const statSamplesEl = document.getElementById('stat-samples');
  const statAvgUtilityEl = document.getElementById('stat-avg-utility');
  const statValueEl = document.getElementById('stat-value');

  function getParams() {
    function readNum(id, fallback) {
      const v = parseFloat(document.getElementById(id).value);
      return Number.isNaN(v) ? fallback : v;
    }
    return {
      moveReward:    readNum('moveReward', -0.1),
      passReward:    readNum('passReward', 40),
      volcanoReward: readNum('volcanoReward', -50),
      smallReward:   readNum('smallReward', 2),
      slipProb:      Math.min(1, Math.max(0, readNum('slipProb', 0.3))),
      discount:      Math.min(1, Math.max(0, readNum('discount', 0.9)))
    };
  }

  function buildGrid() {
    gridEl.innerHTML = '';
    const params = getParams();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        const type = getCellType(r, c);

        const label = document.createElement('span');
        label.className = 'cell-label';
        label.textContent = `(${r + 1},${c + 1})`;
        cell.appendChild(label);

        if (type === CELL_GOAL) {
          cell.classList.add('cell-goal');
          const tl = document.createElement('span');
          tl.className = 'cell-type-label';
          tl.textContent = 'GOAL';
          cell.appendChild(tl);
          const rv = document.createElement('span');
          rv.className = 'cell-reward-value goal-value';
          rv.textContent = `+${params.passReward}`;
          cell.appendChild(rv);
        } else if (type === CELL_VOLCANO) {
          cell.classList.add('cell-volcano');
          const tl = document.createElement('span');
          tl.className = 'cell-type-label';
          tl.textContent = 'VOLCANO';
          cell.appendChild(tl);
          const rv = document.createElement('span');
          rv.className = 'cell-reward-value volcano-value';
          rv.textContent = `${params.volcanoReward}`;
          cell.appendChild(rv);
        } else if (type === CELL_SMALL_REWARD) {
          cell.classList.add('cell-small-reward');
          const tl = document.createElement('span');
          tl.className = 'cell-type-label';
          tl.textContent = 'REWARD';
          cell.appendChild(tl);
          const rv = document.createElement('span');
          rv.className = 'cell-reward-value small-reward-value';
          rv.textContent = `+${params.smallReward}`;
          cell.appendChild(rv);
        } else {
          if (type === CELL_START) {
            cell.classList.add('cell-start');
          }
          const pad = document.createElement('div');
          pad.className = 'arrow-pad';

          for (const dir of DIR_NAMES) {
            const btn = document.createElement('button');
            btn.className = 'arrow-btn';
            btn.dataset.dir = dir;
            btn.dataset.row = r;
            btn.dataset.col = c;
            btn.textContent = DIR_ARROWS[dir];
            btn.setAttribute('aria-label', `Set direction ${dir} for cell (${r+1},${c+1})`);
            if (policy[`${r},${c}`] === dir) {
              btn.classList.add('active');
            }
            btn.addEventListener('click', () => setPolicy(r, c, dir));
            pad.appendChild(btn);
          }

          const centerDiv = document.createElement('div');
          centerDiv.className = 'arrow-center';
          if (type === CELL_START) {
            centerDiv.innerHTML = '<span class="start-badge">START</span>';
          }
          pad.appendChild(centerDiv);

          cell.appendChild(pad);
        }

        gridEl.appendChild(cell);
      }
    }
  }

  function setPolicy(r, c, dir) {
    policy[`${r},${c}`] = dir;
    const cell = gridEl.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
    if (!cell) return;
    cell.querySelectorAll('.arrow-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.dir === dir);
    });
  }

  function samplePath() {
    const params = getParams();
    let r = 1, c = 0;
    const visited = [{ r, c }];
    const rewards = [];
    const slipped = [];
    let steps = 0;

    while (steps < 100) {
      const intended = policy[`${r},${c}`] || 'right';

      let actual;
      let wasSlip = false;
      if (Math.random() < params.slipProb) {
        actual = DIR_NAMES[Math.floor(Math.random() * 4)];
        wasSlip = true;
      } else {
        actual = intended;
      }

      const [dr, dc] = DIRS[actual];
      let nr = r + dr;
      let nc = c + dc;

      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) {
        nr = r;
        nc = c;
      }

      if (isTerminal(nr, nc)) {
        const tt = getCellType(nr, nc);
        let reward;
        if (tt === CELL_GOAL) {
          reward = params.moveReward + params.passReward;
        } else if (tt === CELL_VOLCANO) {
          reward = params.moveReward + params.volcanoReward;
        } else if (tt === CELL_SMALL_REWARD) {
          reward = params.moveReward + params.smallReward;
        }
        visited.push({ r: nr, c: nc });
        rewards.push(reward);
        slipped.push(wasSlip);
        break;
      } else {
        r = nr;
        c = nc;
        visited.push({ r, c });
        rewards.push(params.moveReward);
        slipped.push(wasSlip);
      }

      steps++;
    }

    let utility = 0;
    const gamma = params.discount;
    for (let i = 0; i < rewards.length; i++) {
      utility += Math.pow(gamma, i) * rewards[i];
    }

    return { visited, rewards, utility, gamma, slipped };
  }

  function updateStats() {
    statSamplesEl.textContent = paths.length;

    if (paths.length === 0) {
      statAvgUtilityEl.textContent = '—';
      statValueEl.textContent = '—';
      return;
    }

    const avg = totalUtility / paths.length;
    statAvgUtilityEl.textContent = avg.toFixed(4);
    statValueEl.textContent = avg.toFixed(4);

    statValueEl.classList.remove('value-pulse');
    void statValueEl.offsetWidth;
    statValueEl.classList.add('value-pulse');
  }

  function clearPathVisualization() {
    gridEl.querySelectorAll('.step-marker').forEach(el => el.remove());
    gridEl.querySelectorAll('.on-path').forEach(el => el.classList.remove('on-path'));
  }

  function visualizePath(pathData) {
    clearPathVisualization();

    const cells = gridEl.querySelectorAll('.grid-cell');
    const cellGrid = [];
    for (let r = 0; r < ROWS; r++) {
      cellGrid[r] = [];
    }
    cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      cellGrid[row][col] = cell;
    });

    pathData.visited.forEach((pos, i) => {
      const cell = cellGrid[pos.r][pos.c];
      if (!cell) return;

      cell.classList.add('on-path');

      const marker = document.createElement('div');
      marker.className = 'step-marker';
      marker.textContent = i;

      if (i === pathData.visited.length - 1) {
        const ct = getCellType(pos.r, pos.c);
        if (ct === CELL_GOAL) marker.classList.add('terminal-goal');
        if (ct === CELL_VOLCANO) marker.classList.add('terminal-volcano');
        if (ct === CELL_SMALL_REWARD) marker.classList.add('terminal-small-reward');
      }

      const angle = (i * 137.508) * Math.PI / 180;
      const radius = Math.min(15, 5 + i * 2);
      const offsetX = 50 + Math.cos(angle) * radius;
      const offsetY = 50 + Math.sin(angle) * radius;
      marker.style.top = `${offsetY}%`;
      marker.style.left = `${offsetX}%`;
      marker.style.transform = 'translate(-50%, -50%) scale(0)';

      cell.appendChild(marker);

      setTimeout(() => {
        marker.classList.add('visible');
        marker.style.transform = 'translate(-50%, -50%) scale(1)';
      }, i * 50);
    });
  }

  function doSample(count) {
    let lastPath;
    const fragment = document.createDocumentFragment();
    const emptyEl = document.getElementById('path-log-empty');
    if (emptyEl) emptyEl.style.display = 'none';

    const prev = pathLogEl.querySelector('.path-entry.latest');
    if (prev) prev.classList.remove('latest');

    for (let i = 0; i < count; i++) {
      const p = samplePath();
      paths.push(p);
      totalUtility += p.utility;
      lastPath = p;

      const entry = createPathEntry(p, paths.length, i === count - 1);
      fragment.insertBefore(entry, fragment.firstChild);
    }

    pathLogEl.insertBefore(fragment, pathLogEl.firstChild);
    updateStats();
    if (lastPath) visualizePath(lastPath);
  }

  function createPathEntry(pathData, index, isLatest) {
    const entry = document.createElement('div');
    entry.className = 'path-entry' + (isLatest ? ' latest' : '');

    const stepsStr = pathData.visited.map(v => `(${v.r+1},${v.c+1})`).join(' \u2192 ');

    let formulaParts = [];
    const maxShow = Math.min(pathData.rewards.length, 6);
    for (let i = 0; i < maxShow; i++) {
      const gammaStr = i === 0 ? '' : i === 1 ? `${pathData.gamma}\u00b7` : `${pathData.gamma}<sup>${i}</sup>\u00b7`;
      const rStr = `(${pathData.rewards[i]})`;
      formulaParts.push(`${gammaStr}${rStr}`);
    }
    let formulaStr = formulaParts.join(' + ');
    if (pathData.rewards.length > maxShow) {
      formulaStr += ` + \u2026 (${pathData.rewards.length} terms)`;
    }

    const utilityClass = pathData.utility >= 0 ? 'positive' : 'negative';

    entry.innerHTML = `
      <div class="path-entry-header">
        <span class="path-number">Path #${index}</span>
        <span class="path-utility ${utilityClass}">${pathData.utility.toFixed(4)}</span>
      </div>
      <div class="path-steps">${stepsStr}</div>
      <div class="path-formula">= ${formulaStr}</div>
    `;
    return entry;
  }

  function resetSamples() {
    paths = [];
    totalUtility = 0;
    updateStats();
    clearPathVisualization();

    pathLogEl.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'path-log-empty';
    empty.id = 'path-log-empty';
    empty.innerHTML = 'No paths sampled yet. Click <strong>Sample 1 Path</strong> to begin.';
    pathLogEl.appendChild(empty);
  }

  function onParamChange() {
    buildGrid();
  }

  (function () {
    const toggle = document.querySelector('[data-theme-toggle]');
    const root = document.documentElement;
    let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);

    if (toggle) {
      toggle.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', theme);
        toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        toggle.innerHTML = theme === 'dark'
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      });
    }
  })();

  buildGrid();

  document.getElementById('btn-sample').addEventListener('click', () => doSample(1));
  document.getElementById('btn-sample100').addEventListener('click', () => doSample(1000));
  document.getElementById('btn-reset').addEventListener('click', resetSamples);

  ['moveReward', 'passReward', 'volcanoReward', 'smallReward', 'slipProb', 'discount'].forEach(id => {
    document.getElementById(id).addEventListener('change', onParamChange);
  });

})();