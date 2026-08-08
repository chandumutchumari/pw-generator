// Global functions (called from HTML onclick)
function getCharset() {
  const sel = document.querySelector('input[name="charset"]:checked').value;
  if (sel === 'custom') return [...new Set(document.getElementById('customChars').value.split(''))].join('');
  return sel;
}

function formatTotal(n) {
  if (n < 1e15) return n.toLocaleString();
  const exp = Math.floor(Math.log10(n));
  const base = (n / Math.pow(10, exp)).toFixed(2);
  const sup = exp.toString().split('').map(c => '\u00b0\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079'[parseInt(c)] || c).join('');
  return base + ' × 10' + sup + '+';
}

function updateCount() {
  const cs = getCharset();
  const len = parseInt(document.getElementById('missingLen').value) || 0;
  const box = document.getElementById('countDisplay');
  if (!cs || len < 1) { box.textContent = '—'; box.className = 'count'; return; }
  const total = Math.pow(cs.length, len);
  box.textContent = formatTotal(total);
  box.className = 'count' + (total > 500000 ? ' warn' : '');
  document.getElementById('generateBtn').disabled = false;
}

function* cartesian(cs, len) {
  const n = cs.length;
  const indices = new Array(len).fill(0);
  while (true) {
    yield indices.map(i => cs[i]).join('');
    let pos = len - 1;
    while (pos >= 0) {
      indices[pos]++;
      if (indices[pos] < n) break;
      indices[pos] = 0;
      pos--;
    }
    if (pos < 0) break;
  }
}

let gen = null;
let curPrefix = '', curSuffix = '', curCs = '';
let totalCombos = 0;
const pageSize = 100;
let pageNum = 0;
let pageCache = {};
let nextFillIndex = 0;
let lastAttempted = '';
let lastSuccess = '';
let autoFillRunning = false;
let autoFillHandle = null;

function getAutoDelay() {
  const value = parseInt(document.getElementById('autoDelay')?.value, 10);
  if (!value || value < 100) return 100;
  if (value > 2000) return 2000;
  return value;
}

function setLastAttempted(candidate) {
  lastAttempted = candidate || '';
  document.getElementById('lastUsedDisplay').textContent = candidate || '—';
}

function getPageCandidates() {
  return pageCache[pageNum] || [];
}

function setLastSuccess(candidate) {
  lastSuccess = candidate || '';
  document.getElementById('lastSuccessDisplay').textContent = candidate || '—';
}

function setAutoStatus(status) {
  document.getElementById('autoStatusDisplay').textContent = status;
}

function sendFillMessage(candidate, selector, submitSelector) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'fillCandidate', candidate, selector, submitSelector }, resolve);
  });
}

async function fillCandidate(candidate) {
  const selector = document.getElementById('targetSelector').value.trim();
  const submitSelector = document.getElementById('submitSelector').value.trim();
  if (!selector) { showToast('Enter target selector first'); return { success: false, error: 'No selector' }; }
  if (!candidate) { showToast('No candidate to fill'); return { success: false, error: 'No candidate' }; }

  setLastAttempted(candidate);
  const result = await sendFillMessage(candidate, selector, submitSelector);

  if (result?.error) {
    showToast('Fill failed: ' + result.error);
    return { success: false, error: result.error };
  }

  const ok = !!result.success;
  if (ok) {
    setLastSuccess(candidate);
    showToast('Success: ' + candidate);
  } else {
    showToast('Filled; verify login');
  }

  return { success: ok, candidate };
}

async function fillNextCandidate() {
  const items = getPageCandidates();
  if (!items.length) { showToast('No candidates generated'); return; }
  const candidate = items[nextFillIndex % items.length];
  nextFillIndex += 1;
  await fillCandidate(candidate);
}

function markSuccess() {
  if (!lastAttempted) { showToast('No candidate has been filled yet'); return; }
  setLastSuccess(lastAttempted);
  stopAutoFill();
  showToast('Success recorded: ' + lastAttempted);
}

function stopAutoFill() {
  autoFillRunning = false;
  setAutoStatus('Stopped');
  document.getElementById('startAutoBtn').disabled = false;
  document.getElementById('stopAutoBtn').disabled = true;
  if (autoFillHandle) {
    clearTimeout(autoFillHandle);
    autoFillHandle = null;
  }
}

function scheduleAutoFill(delay = 600) {
  autoFillHandle = setTimeout(autoFillLoop, delay);
}

function startAutoFill() {
  if (autoFillRunning) return;
  if (!getPageCandidates().length) { showToast('Generate candidates first'); return; }
  const delay = getAutoDelay();
  autoFillRunning = true;
  setAutoStatus('Running @ ' + delay + 'ms');
  document.getElementById('startAutoBtn').disabled = true;
  document.getElementById('stopAutoBtn').disabled = false;
  autoFillLoop();
}

async function autoFillLoop() {
  if (!autoFillRunning) return;
  const items = getPageCandidates();
  if (!items.length) {
    stopAutoFill();
    showToast('No candidates available');
    return;
  }

  if (nextFillIndex >= items.length) {
    const totalPages = Math.ceil(totalCombos / pageSize);
    if (pageNum < totalPages - 1) {
      goPage(pageNum + 1);
      nextFillIndex = 0;
      scheduleAutoFill();
      return;
    }
    stopAutoFill();
    showToast('Reached end of candidates');
    return;
  }

  const candidate = items[nextFillIndex];
  nextFillIndex += 1;
  const result = await fillCandidate(candidate);

  if (result.success) {
    stopAutoFill();
    return;
  }

  if (autoFillRunning) {
    scheduleAutoFill(getAutoDelay());
  }
}

function generate() {
  stopAutoFill();
  nextFillIndex = 0;
  setLastAttempted('');
  setLastSuccess('');
  setAutoStatus('Stopped');
  curPrefix = document.getElementById('prefix').value;
  curSuffix = document.getElementById('suffix').value;
  curCs = getCharset();
  const len = parseInt(document.getElementById('missingLen').value) || 2;
  if (!curCs) { showToast('No characters defined!'); return; }
  if (len < 1) { showToast('Missing length must be at least 1'); return; }
  totalCombos = Math.pow(curCs.length, len);
  pageNum = 0;
  pageCache = {};
  gen = cartesian(curCs, len);
  document.getElementById('searchBox').value = '';
  document.getElementById('resultsCard').classList.add('visible');
  renderPage();
  showToast('Total: ' + formatTotal(totalCombos) + ' candidates');
  document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPage() {
  if (!pageCache[pageNum]) {
    const batch = [];
    for (let i = 0; i < pageSize; i++) {
      const r = gen.next();
      if (r.done) break;
      batch.push(curPrefix + r.value + curSuffix);
    }
    pageCache[pageNum] = batch;
  }
  const items = pageCache[pageNum];
  const totalPages = Math.ceil(totalCombos / pageSize);
  const startIdx = pageNum * pageSize + 1;
  const endIdx = Math.min(startIdx + items.length - 1, totalCombos);
  document.getElementById('resultsTitle').textContent =
    startIdx.toLocaleString() + '–' + endIdx.toLocaleString() + ' of ' + formatTotal(totalCombos);
  renderList(items);
  renderPagination(totalPages);
}

function renderList(items) {
  const wrap = document.getElementById('listWrap');
  const q = document.getElementById('searchBox').value.toLowerCase();
  const filtered = q ? items.filter(p => p.toLowerCase().includes(q)) : items;
  if (!filtered.length) { wrap.innerHTML = '<div class="no-results">No matches.</div>'; return; }
  const frag = document.createDocumentFragment();
  filtered.forEach(pw => {
    const div = document.createElement('div'); div.className = 'pw-item';
    const span = document.createElement('span'); span.className = 'pw-text';
    const pfx = curPrefix || '', sfx = curSuffix || '';
    const mid = pw.slice(pfx.length, pw.length - (sfx.length || 0)) || pw;
    span.innerHTML =
      (pfx ? '<span style="color:var(--muted)">' + esc(pfx) + '</span>' : '') +
      '<span class="pw-suffix">' + esc(mid) + '</span>' +
      (sfx ? '<span style="color:var(--muted)">' + esc(sfx) + '</span>' : '');
    const copyBtn = document.createElement('button'); copyBtn.className = 'copy-btn'; copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(pw).then(() => {
        copyBtn.textContent = '✓'; copyBtn.classList.add('copied');
        setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1200);
      });
    });

    const fillBtn = document.createElement('button'); fillBtn.className = 'copy-btn'; fillBtn.textContent = 'Fill';
    fillBtn.addEventListener('click', () => fillCandidate(pw));

    div.appendChild(span);
    const buttonWrap = document.createElement('div'); buttonWrap.style.display = 'flex'; buttonWrap.style.gap = '6px';
    buttonWrap.appendChild(copyBtn);
    buttonWrap.appendChild(fillBtn);
    div.appendChild(buttonWrap);
    frag.appendChild(div);
  });
  wrap.innerHTML = ''; wrap.appendChild(frag);
}

function renderPagination(totalPages) {
  const pg = document.getElementById('paginationBar');
  const prevDis = pageNum === 0, nextDis = pageNum >= totalPages - 1;
  pg.innerHTML =
    '<button class="btn-sm" onclick="goPage(' + (pageNum-1) + ')" ' + (prevDis?'disabled':'') + '>← Prev</button>' +
    '<span style="font-size:0.72rem;color:var(--muted);white-space:nowrap">Pg <strong style="color:var(--text)">' + formatTotal(pageNum+1) + '</strong> / ' + formatTotal(totalPages) + '</span>' +
    '<button class="btn-sm" onclick="goPage(' + (pageNum+1) + ')" ' + (nextDis?'disabled':'') + '>Next →</button>' +
    '<input type="number" min="1" max="' + totalPages + '" value="' + (pageNum+1) + '" onchange="goPage(parseInt(this.value)-1)" style="width:60px;padding:5px 7px;font-size:0.75rem;background:var(--bg);border:1px solid var(--border);border-radius:5px;color:var(--text);text-align:center;" placeholder="#"/>';
}

function goPage(n) {
  const totalPages = Math.ceil(totalCombos / pageSize);
  if (n < 0 || n >= totalPages) return;
  while (pageNum < n) {
    pageNum++;
    if (!pageCache[pageNum]) {
      const batch = [];
      for (let i = 0; i < pageSize; i++) { const r = gen.next(); if (r.done) break; batch.push(curPrefix + r.value + curSuffix); }
      pageCache[pageNum] = batch;
    }
  }
  pageNum = n;
  nextFillIndex = 0;
  renderPage();
  document.getElementById('listWrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterList() { if (pageCache[pageNum]) renderList(pageCache[pageNum]); }

function copyPage() {
  navigator.clipboard.writeText((pageCache[pageNum]||[]).join('\n')).then(() => showToast('Page copied!'));
}

function exportTxt() {
  const blob = new Blob([(pageCache[pageNum]||[]).join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pw-candidates-page' + (pageNum+1) + '.txt';
  a.click(); URL.revokeObjectURL(a.href);
  showToast('Exported!');
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function minimizePanel() {
  document.getElementById('main').classList.add('hidden');
  document.getElementById('dot').classList.add('visible');
}

function restore() {
  document.getElementById('dot').classList.remove('visible');
  document.getElementById('main').classList.remove('hidden');
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  // Charset radio
  document.querySelectorAll('input[name="charset"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('customArea').classList.toggle('visible', r.value === 'custom');
      updateCount();
    });
  });

  // Input fields
  ['prefix','suffix','missingLen','customChars'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.addEventListener('input', updateCount); el.addEventListener('change', updateCount); }
  });

  // Buttons
  document.getElementById('generateBtn').addEventListener('click', generate);
  document.getElementById('fillNextBtn').addEventListener('click', fillNextCandidate);
  document.getElementById('startAutoBtn').addEventListener('click', startAutoFill);
  document.getElementById('stopAutoBtn').addEventListener('click', stopAutoFill);
  document.getElementById('markSuccessBtn').addEventListener('click', markSuccess);
  document.getElementById('copyPageBtn').addEventListener('click', copyPage);
  document.getElementById('exportBtn').addEventListener('click', exportTxt);
  document.getElementById('minBtn').addEventListener('click', minimizePanel);
  document.getElementById('dot').addEventListener('click', restore);
  document.getElementById('autoDelay').addEventListener('change', () => setAutoStatus('Stopped'));

  // Search
  document.getElementById('searchBox').addEventListener('input', filterList);

  updateCount();
});
