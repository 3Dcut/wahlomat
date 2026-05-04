// ====================================================================
// WahlEra APP LOGIC
// ====================================================================

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────
  const state = {
    currentQuestion: 0,
    answers:         {},   // { q01: 3, q02: null (skipped) }
    weights:         {},   // { q01: 2 } — nur doppelt-gewichtete
    results:         [],   // [{ candidate, matchPercent }, ...] sorted desc
    partyResults:    [],   // [{ party, avgMatch, cohesion, members }, ...]
    categoryResults: {},   // { category: { candidateId: pct } },
    // Scaling & Filtering state
    filterParty:     null, // ID of the party to filter by
    searchQuery:     '',
    resultsLimit:    10
  };

  // ── Data accessors ─────────────────────────────────────────────────
  const DATA       = () => window.WAHLERA_DATA;
  const questions  = () => DATA().questions;
  const scoredQuestions = () => {
    const qs = questions();
    const toggle = document.getElementById('btn-toggle-spionage');
    const includeSpionage = toggle ? toggle.dataset.included === 'true' : true;
    return includeSpionage ? qs : qs.filter(q => q.id !== 'q09');
  };
  const candidates = () => DATA().candidates;
  const parties    = () => DATA().parties || [];

  function partyById(id) { return parties().find(p => p.id === id) || null; }
  function candidateParty(c) { return c.party ? partyById(c.party) : null; }

  // ── Dark mode ──────────────────────────────────────────────────────
  function initDarkMode() {
    const saved = localStorage.getItem('wom_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    updateDarkToggle(theme);
  }
  function toggleDarkMode() {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('wom_theme', next);
    updateDarkToggle(next);
  }
  function updateDarkToggle(theme) {
    const btn = document.getElementById('btn-dark-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // ── localStorage ───────────────────────────────────────────────────
  const STORAGE_KEY = 'wom_state';
  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      answers: state.answers,
      weights: state.weights,
      currentQuestion: state.currentQuestion
    }));
  }
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  function clearStorage() { localStorage.removeItem(STORAGE_KEY); }

  // ── URL sharing ────────────────────────────────────────────────────
  function encodeShareState() {
    return btoa(JSON.stringify({ a: state.answers, w: state.weights }));
  }
  function decodeShareState(str) {
    try {
      const d = JSON.parse(atob(str));
      return (d && d.a) ? d : null;
    } catch { return null; }
  }
  function getShareUrl() {
    const base = location.origin + location.pathname;
    return `${base}?s=${encodeShareState()}#results`;
  }

  // ── Toast ──────────────────────────────────────────────────────────
  function showToast(msg, ms = 2500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('out');
      toast.addEventListener('animationend', () => toast.remove());
    }, ms);
  }

  // ── Router ─────────────────────────────────────────────────────────
  const SCREENS = ['start', 'quiz', 'results', 'compare', 'overview', 'profile'];

  function showScreen(id, pushState = true) {
    SCREENS.forEach(s => {
      const el = document.getElementById('screen-' + s);
      if (!el) return;
      el.classList.add('hidden');
      el.classList.remove('visible');
    });
    const target = document.getElementById('screen-' + id);
    if (!target) return;
    target.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => target.classList.add('visible')));
    if (pushState) history.pushState({ screen: id }, '', '#' + id);
    window.scrollTo(0, 0);
  }

  window.addEventListener('popstate', (e) => {
    const id = (e.state && e.state.screen) ? e.state.screen : 'start';
    showScreen(id, false);
    if (id === 'results') renderResults();
    if (id === 'overview') renderOverview();
    if (id === 'profile' && state.selectedCandidateId) renderProfile(state.selectedCandidateId);
  });

  // ── Score calculation ──────────────────────────────────────────────
  function calculateMatch(candidate) {
    let weightedSum = 0, totalWeight = 0;
    for (const q of scoredQuestions()) {
      const u = state.answers[q.id];
      if (u == null) continue;
      const c = candidate.answers[q.id] ?? 3;
      const w = state.weights[q.id] === 2 ? 2 : 1;
      weightedSum += w * (1 - Math.abs(u - c) / 4);
      totalWeight += w;
    }
    if (totalWeight === 0) return null;
    return Math.round((weightedSum / totalWeight) * 100);
  }

  function computeAllResults() {
    state.results = candidates()
      .map(c => ({ candidate: c, matchPercent: calculateMatch(c) }))
      .sort((a, b) => {
        if (a.matchPercent == null) return 1;
        if (b.matchPercent == null) return -1;
        return b.matchPercent - a.matchPercent;
      });
  }

  function computePartyResults() {
    const matchMap = {};
    state.results.forEach(r => { matchMap[r.candidate.id] = r.matchPercent; });

    state.partyResults = parties().map(party => {
      const members = candidates().filter(c => c.party === party.id);
      const matches = members.map(c => matchMap[c.id]).filter(v => v != null);
      const avgMatch = matches.length ? Math.round(matches.reduce((a, b) => a + b, 0) / matches.length) : null;

      // Pairwise cohesion
      let cohesion = null;
      if (members.length >= 2) {
        let pairSum = 0, pairCount = 0;
        for (let i = 0; i < members.length; i++) {
          for (let j = i + 1; j < members.length; j++) {
            const c1 = members[i], c2 = members[j];
            let qSum = 0, qCount = 0;
            for (const q of scoredQuestions()) {
              const a1 = c1.answers[q.id] ?? 3;
              const a2 = c2.answers[q.id] ?? 3;
              qSum += 1 - Math.abs(a1 - a2) / 4;
              qCount++;
            }
            if (qCount > 0) { pairSum += qSum / qCount; pairCount++; }
          }
        }
        cohesion = pairCount > 0 ? Math.round((pairSum / pairCount) * 100) : null;
      } else if (members.length === 1) {
        cohesion = 100;
      }

      return { party, members, avgMatch, cohesion };
    }).sort((a, b) => {
      if (a.avgMatch == null) return 1;
      if (b.avgMatch == null) return -1;
      return b.avgMatch - a.avgMatch;
    });
  }

  function computeCategoryResults() {
    const sqs = scoredQuestions();
    const cats = [...new Set(sqs.map(q => q.category).filter(Boolean))];
    state.categoryResults = {};
    for (const cat of cats) {
      state.categoryResults[cat] = {};
      const catQs = sqs.filter(q => q.category === cat);
      for (const cand of candidates()) {
        let wSum = 0, wTotal = 0;
        for (const q of catQs) {
          const u = state.answers[q.id];
          if (u == null) continue;
          const c = cand.answers[q.id] ?? 3;
          const w = state.weights[q.id] === 2 ? 2 : 1;
          wSum += w * (1 - Math.abs(u - c) / 4);
          wTotal += w;
        }
        state.categoryResults[cat][cand.id] = wTotal > 0 ? Math.round(wSum / wTotal * 100) : null;
      }
    }
  }

  // ── Party badge HTML ───────────────────────────────────────────────
  function partyBadgeHtml(candidate) {
    const party = candidateParty(candidate);
    if (!party) return '';
    const col = party.color;
    return `<span class="party-badge" style="color:${col};border-color:${col};background:${col}18">
      <span class="candidate-dot" style="background:${col}"></span>${party.name}
    </span>`;
  }

  // ── Screen: Quiz ───────────────────────────────────────────────────
  function renderQuestion(index, direction = 'initial') {
    const qs = questions();
    if (index >= qs.length) {
      computeAllResults();
      computePartyResults();
      computeCategoryResults();
      renderResults();
      showScreen('results');
      return;
    }

    const q = qs[index];
    const total = qs.length;
    const progressPct = Math.round((index / total) * 100);
    const currentAnswer = state.answers[q.id];
    const isDoubled = state.weights[q.id] === 2;

    // Detect if answer came from poleA side (1-2) or poleB side (4-5)
    const highlightA = currentAnswer != null && currentAnswer <= 2;
    const highlightB = currentAnswer != null && currentAnswer >= 4;

    const voteButtons = [1, 2, 3, 4, 5].map(v => {
      const sel = currentAnswer === v ? ' selected' : '';
      const sideClass = v <= 2 ? ' vote-side-a' : v >= 4 ? ' vote-side-b' : ' vote-neutral';
      return `<button class="vote-btn${sel}${sideClass}" data-value="${v}" aria-label="Wert ${v}">${v}</button>`;
    }).join('');

    // Compute initial glow classes for existing answer
    const glowA = (currentAnswer === 1) ? ' highlighted glow-strong' : (currentAnswer === 2) ? ' highlighted' : '';
    const glowB = (currentAnswer === 4) ? ' highlighted' : (currentAnswer === 5) ? ' highlighted glow-strong' : '';

    const slideClass = direction === 'forward' ? 'slide-in-right' : direction === 'backward' ? 'slide-in-left' : 'slide-in-up';

    const html = `
      <div class="screen-inner ${slideClass}">
        <!-- Progress -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
          <span class="text-muted" style="font-size:0.82rem">Frage ${index + 1} von ${total}</span>
          <span style="font-size:0.82rem;font-weight:600;color:var(--accent)">${progressPct}%</span>
        </div>
        <div class="progress-track" style="margin-bottom:1.5rem">
          <div class="progress-fill" style="width:${progressPct}%"></div>
        </div>

        <!-- Category -->
        ${q.category ? `<span class="badge badge-accent" style="display:inline-block;margin-bottom:0.875rem">${q.category}</span>` : ''}

        <div class="bipolar-layout card" style="padding:2.5rem 2rem;margin-bottom:2.5rem;background:rgba(255,255,255,0.01)">
          <div class="pole-card pole-a${glowA}" id="pole-a-card">
            <div class="pole-text">${q.poleA || q.text || ''}</div>
          </div>

          <div class="voting-column">
            <div class="voting-buttons" id="voting-buttons">
              ${voteButtons}
            </div>
          </div>

          <div class="pole-card pole-b${glowB}" id="pole-b-card">
            <div class="pole-text">${q.poleB || ''}</div>
          </div>
        </div>

        <!-- Hint (collapsible) -->
        ${q.hint ? `
        <div style="margin-bottom:1.5rem">
          <button id="hint-toggle" class="btn btn-ghost" style="font-size:0.8rem;padding:0.35rem 0.75rem">
            💡 Erläuterung
          </button>
          <div id="hint-content" class="hint-content card" style="margin-top:0.5rem;padding:0.75rem;font-size:0.82rem;color:var(--text-muted)">${q.hint}</div>
        </div>
        ` : ''}

        <!-- Weighted Vote Focus -->
        <div style="display:flex;justify-content:center;margin-bottom:2.5rem">
          <button id="btn-weight" class="btn btn-ghost weight-btn${isDoubled ? ' active' : ''}" style="font-size:1rem;padding:0.85rem 2.5rem;border-width:2px;min-width:16rem">
            ⚖ Doppelt gewichten
          </button>
        </div>

        <!-- Navigation Actions -->
        <div style="display:grid;grid-template-columns:1fr 1.5fr 1fr;align-items:center;gap:1.5rem;margin-top:1.5rem">
          <div style="text-align:left">
            ${index > 0 ? `<button id="btn-prev" class="btn btn-ghost" style="padding:0.75rem 2rem">← Zurück</button>` : ''}
          </div>
          <div style="text-align:center">
            <button id="btn-skip" class="btn btn-ghost" style="font-size:0.85rem;padding:0.75rem 2rem">Überspringen</button>
          </div>
          <div style="text-align:right">
            <button id="btn-next" class="btn btn-primary" style="padding:0.75rem 3rem" ${currentAnswer == null ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''}>
              ${index === total - 1 ? 'Auswerten →' : 'Weiter →'}
            </button>
          </div>
        </div>
      </div>
    `;

    const section = document.getElementById('screen-quiz');
    section.innerHTML = html;
    attachQuizListeners(section, q, index, total);
  }

  function attachQuizListeners(section, q, index, total) {
    // Vote buttons — no full re-render, DOM update only
    section.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = parseInt(btn.dataset.value);
        state.answers[q.id] = v;
        saveToStorage();

        // Update selected state on buttons
        section.querySelectorAll('.vote-btn').forEach(b => b.classList.toggle('selected', parseInt(b.dataset.value) === v));
        const selectedBtn = section.querySelector('.vote-btn.selected');
        if (selectedBtn) {
          selectedBtn.classList.add('pulse');
          selectedBtn.addEventListener('animationend', () => selectedBtn.classList.remove('pulse'), { once: true });
        }

        // Pole glow based on vote strength
        const poleA = section.querySelector('#pole-a-card');
        const poleB = section.querySelector('#pole-b-card');
        if (poleA) poleA.classList.remove('highlighted', 'glow-strong', 'glow-mild');
        if (poleB) poleB.classList.remove('highlighted', 'glow-strong', 'glow-mild');
        if (v === 1) {
          poleA?.classList.add('highlighted', 'glow-strong');
        } else if (v === 2) {
          poleA?.classList.add('highlighted', 'glow-mild');
        } else if (v === 4) {
          poleB?.classList.add('highlighted', 'glow-mild');
        } else if (v === 5) {
          poleB?.classList.add('highlighted', 'glow-strong');
        }

        // Enable next button
        const nextBtn = section.querySelector('#btn-next');
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.style.opacity = '';
          nextBtn.style.cursor = '';
        }
      });
    });

    // Hint toggle
    const hintToggle = section.querySelector('#hint-toggle');
    if (hintToggle) {
      hintToggle.addEventListener('click', () => {
        section.querySelector('#hint-content').classList.toggle('open');
      });
    }

    // Weight toggle
    section.querySelector('#btn-weight')?.addEventListener('click', () => {
      if (state.weights[q.id] === 2) delete state.weights[q.id];
      else state.weights[q.id] = 2;
      saveToStorage();
      section.querySelector('#btn-weight').classList.toggle('active', state.weights[q.id] === 2);
    });

    // Skip
    section.querySelector('#btn-skip')?.addEventListener('click', () => {
      state.answers[q.id] = null;
      state.currentQuestion = index + 1;
      saveToStorage();
      renderQuestion(index + 1, 'forward');
    });

    // Prev
    section.querySelector('#btn-prev')?.addEventListener('click', () => {
      state.currentQuestion = index - 1;
      renderQuestion(index - 1, 'backward');
    });

    // Next
    section.querySelector('#btn-next')?.addEventListener('click', () => {
      if (state.answers[q.id] == null) return;
      state.currentQuestion = index + 1;
      renderQuestion(index + 1, 'forward');
    });

    state.currentQuestion = index;
  }

  // ── Screen: Results ────────────────────────────────────────────────
  function renderResults() {
    const section = document.getElementById('screen-results');
    const answeredCount = questions().filter(q => state.answers[q.id] != null).length;

    if (answeredCount === 0) {
      section.innerHTML = `
        <div class="screen-inner slide-in-up">
          <div class="card" style="padding:3rem 2rem;text-align:center;background:var(--accent-light);border-color:var(--accent)">
            <span style="font-size:3rem;display:block;margin-bottom:1rem">🤔</span>
            <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:0.5rem">Noch keine Antworten</h2>
            <p class="text-muted" style="max-width:24rem;margin:0 auto 1.5rem">
              Du hast bisher keine Fragen beantwortet. Ohne deine Antworten können wir keine Übereinstimmung mit Kandidat:innen berechnen.
            </p>
            <button id="btn-back-to-quiz" class="btn btn-primary">Fragen beantworten →</button>
          </div>
        </div>
      `;
      section.querySelector('#btn-back-to-quiz').addEventListener('click', () => {
        renderQuestion(state.currentQuestion, 'forward');
        showScreen('quiz');
      });
      return;
    }

    // Identify Top 3
    const top3 = state.results.slice(0, 3);
    const heroHtml = top3.length > 0 ? `
      <div class="results-hero slide-in-up" style="animation-delay:0.1s">
        ${top3.map((r, i) => {
          const party = candidateParty(r.candidate);
          const color = party ? party.color : 'var(--accent)';
          const medal = ['🥇', '🥈', '🥉'][i];
          const pct = r.matchPercent ?? 0;
          return `
            <div class="card hero-match-card animate-in" 
                 style="--card-color:${color}; --card-color-alpha:${color}33; animation-delay:${i * 0.1}s"
                 onclick="window.WAHLERA_APP.navigateToCompare('${r.candidate.id}')">
              <div class="hero-rank-badge">${medal}</div>
              <div class="hero-avatar-wrap">
                <div class="hero-avatar" style="border-color:${color}">${r.candidate.name[0]}</div>
              </div>
              <div class="hero-match-pct">${pct}%</div>
              <div class="hero-match-label">Übereinstimmung</div>
              <div class="hero-info">
                <div class="hero-name">${r.candidate.name}</div>
                <div class="hero-party" style="color:${color}">${party ? party.name : 'Parteilos'}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : '';

    section.innerHTML = `
      <div class="screen-inner">
        <header style="margin-bottom:3rem" class="slide-in-up">
          <h1 style="font-size:3rem;font-weight:900;color:var(--text);letter-spacing:-0.05em;margin-bottom:0.5rem">Deine Auswertung</h1>
          <p class="text-muted" style="font-size:1.1rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">
            Analyse abgeschlossen: <strong>${answeredCount}</strong> / ${questions().length} Fragen ausgewertet.
          </p>
        </header>

        <!-- Top 3 Hero -->
        ${heroHtml}

        <!-- Mobile Tabs -->
        <div class="tab-bar results-mobile-tabs" style="display:none;margin-bottom:2rem">
          <button class="tab-btn active" data-tab="candidates">Kandidat:innen</button>
          <button class="tab-btn" data-tab="parties">Parteien</button>
        </div>

        <!-- Filter & Search Bar -->
        <div class="results-filter-bar slide-in-up" style="animation-delay:0.2s">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="input-search" class="search-input" placeholder="Nach Name suchen..." value="${state.searchQuery}">
          </div>
          <div class="party-filter-scroll">
            <div class="party-filter-chip${state.filterParty === null ? ' active' : ''}" data-party-id="all">Alle Parteien</div>
            ${parties().map(p => `
              <div class="party-filter-chip${state.filterParty === p.id ? ' active' : ''}" data-party-id="${p.id}">
                ${p.name}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Main Grid -->
        <div class="results-grid">
          <div class="results-col" id="col-candidates">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
              <h2 style="font-size:1.25rem;font-weight:900;margin:0">Alle Kandidat:innen</h2>
              <span class="badge badge-accent" id="candidate-count-label"></span>
            </div>
            <div id="candidates-container">
              ${renderCandidateRows()}
            </div>
          </div>
          <div class="results-col mobile-hidden" id="col-parties">
            <h2 style="font-size:1.25rem;font-weight:900;margin-bottom:1.5rem">Parteien</h2>
            ${renderPartyRows()}
          </div>
        </div>

        <!-- CTA & Tools -->
        <div style="display:grid;grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-top:2rem">
          <div class="cta-next-step" style="margin:0">
            <div class="cta-next-step-text">
              <strong style="display:block;font-size:1.1rem;color:var(--text);margin-bottom:0.25rem">Detail-Analyse</strong>
              Vergleiche deine Positionen Punkt für Punkt mit allen Kandidat:innen.
            </div>
            <button id="btn-to-overview" class="btn btn-primary" style="padding:1rem 2.5rem">Einzelantworten →</button>
          </div>
          <div class="card" style="padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem">
             <button id="btn-cat-toggle" class="btn btn-ghost" style="width:100%">📊 Themen-Check</button>
             <button id="btn-share" class="btn btn-ghost" style="width:100%">🔗 Ergebnis teilen</button>
             <button id="btn-restart" class="btn btn-ghost" style="width:100%; color:var(--danger)">↩ Neustart</button>
          </div>
        </div>

        <div id="cat-section" class="hidden" style="margin-top:2rem">
          <h3 style="margin-bottom:1rem">Übereinstimmung nach Themenbereichen</h3>
          <div style="overflow-x:auto" class="card">
            ${renderCategoryTable()}
          </div>
        </div>
      </div>
    `;

    // Re-attach listeners
    attachResultsListeners(section);
  }

  function attachResultsListeners(section) {
    // Search
    section.querySelector('#input-search')?.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      state.resultsLimit = 10;
      const container = section.querySelector('#candidates-container');
      if (container) container.innerHTML = renderCandidateRows();
      attachRowListeners();
    });

    // Party chips
    section.querySelectorAll('.party-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        state.filterParty = chip.dataset.partyId === 'all' ? null : chip.dataset.partyId;
        state.resultsLimit = 10;
        section.querySelectorAll('.party-filter-chip').forEach(c => c.classList.toggle('active', c === chip));
        const container = section.querySelector('#candidates-container');
        if (container) container.innerHTML = renderCandidateRows();
        attachRowListeners();
      });
    });

    function attachRowListeners() {
      // Bars
      section.querySelectorAll('.result-bar-fill[data-pct]').forEach(bar => {
        requestAnimationFrame(() => { bar.style.width = bar.dataset.pct + '%'; });
      });
      // Rows
      section.querySelectorAll('.result-row-compact').forEach(row => {
        row.addEventListener('click', () => {
          renderCompare(row.dataset.candidateId);
          showScreen('compare');
        });
      });
      // Show more
      section.querySelector('#btn-show-more')?.addEventListener('click', () => {
        state.resultsLimit += 30;
        const container = section.querySelector('#candidates-container');
        if (container) container.innerHTML = renderCandidateRows();
        attachRowListeners();
      });
    }
    attachRowListeners();

    // Party toggles
    section.querySelectorAll('.party-row-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const members = section.querySelector('#party-members-' + btn.dataset.partyId);
        members?.classList.toggle('hidden');
        btn.textContent = members && !members.classList.contains('hidden') ? '▲' : '▼';
      });
    });

    // Category toggle
    section.querySelector('#btn-cat-toggle')?.addEventListener('click', () => {
      section.querySelector('#cat-section').classList.toggle('hidden');
      window.scrollTo({ top: section.querySelector('#cat-section').offsetTop - 100, behavior: 'smooth' });
    });

    // Share, Restart, etc.
    section.querySelector('#btn-share')?.addEventListener('click', () => {
      const url = getShareUrl();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => showToast('🔗 Share-Link kopiert!'));
      } else { alert(url); }
    });

    section.querySelector('#btn-restart')?.addEventListener('click', () => {
      if (confirm('Wirklich neu starten?')) {
        state.answers = {}; state.weights = {}; state.currentQuestion = 0;
        clearStorage(); renderQuestion(0, 'initial'); showScreen('quiz');
      }
    });

    section.querySelector('#btn-to-overview')?.addEventListener('click', () => {
      renderOverview(); showScreen('overview');
    });

    // Mobile tabs
    const tabs = section.querySelectorAll('.results-mobile-tabs .tab-btn');
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const target = t.dataset.tab;
      section.querySelector('#col-candidates').classList.toggle('mobile-hidden', target !== 'candidates');
      section.querySelector('#col-parties').classList.toggle('mobile-hidden', target !== 'parties');
    }));
    if (window.innerWidth <= 840) section.querySelector('.results-mobile-tabs').style.display = 'flex';

    // Spionage toggle logic for dynamic recalculation
    const spionageToggle = document.getElementById('btn-toggle-spionage');
    if (spionageToggle && !spionageToggle.dataset.listenerAttached) {
      spionageToggle.dataset.listenerAttached = 'true';
      spionageToggle.addEventListener('click', () => {
        const isCurrentlyIncluded = spionageToggle.dataset.included === 'true';
        const nextState = !isCurrentlyIncluded;
        spionageToggle.dataset.included = nextState;
        
        if (nextState) {
          spionageToggle.textContent = 'Frage 9: Spaßfrage zur Spionage aus der Wertung ausschließen';
          spionageToggle.style.color = '';
          spionageToggle.style.borderColor = '';
        } else {
          spionageToggle.textContent = 'Frage 9: Spaßfrage zur Spionage ausgeschlossen';
          spionageToggle.style.color = 'var(--text-light)';
          spionageToggle.style.borderColor = 'var(--danger)';
        }

        if (document.getElementById('screen-results').classList.contains('visible')) {
          computeAllResults();
          computePartyResults();
          computeCategoryResults();
          renderResults();
        } else if (document.getElementById('screen-compare').classList.contains('visible')) {
          computeAllResults();
          computePartyResults();
          computeCategoryResults();
          // We need to re-render compare to reflect match percent changes
          const activeCandidateId = document.querySelector('.result-row-compact, .result-row')?.dataset?.candidateId || state.results[0]?.candidate?.id;
          if (activeCandidateId) renderCompare(activeCandidateId);
        }
      });
    }
  }

  function renderCandidateRows() {
    let list = state.results;

    if (state.filterParty) list = list.filter(r => r.candidate.party === state.filterParty);
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(r => r.candidate.name.toLowerCase().includes(q));
    }

    const totalFiltered = list.length;
    const limitedList = list.slice(0, state.resultsLimit);
    const hasMore = totalFiltered > state.resultsLimit;

    const rows = limitedList.map((r, i) => {
      const pct = r.matchPercent ?? 0;
      const party = candidateParty(r.candidate);
      const color = party ? party.color : '#9CA3AF';
      const delay = (i * 0.02).toFixed(2);
      return `
        <div class="result-row-compact animate-fade-in" data-candidate-id="${r.candidate.id}" style="animation-delay:${delay}s">
          <span style="font-size:0.8rem;font-weight:800;color:var(--text-muted);text-align:center">${i + 1}</span>
          <span class="candidate-dot" style="background:${color};width:0.85rem;height:0.85rem;box-shadow:0 0 8px ${color}66"></span>
          <div style="overflow:hidden">
            <div style="font-weight:700;font-size:0.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.candidate.name}</div>
            ${party ? `<div style="font-size:0.65rem;color:${party.color};font-weight:800;text-transform:uppercase">${party.name}</div>` : ''}
          </div>
          <div class="result-bar-track">
            <div class="result-bar-fill" style="width:0%;background:linear-gradient(90deg,${color},${color}cc)" data-pct="${pct}"></div>
          </div>
          <div style="font-weight:900;font-size:1.1rem;text-align:right">${pct}%</div>
          <button class="btn-icon" style="padding:0.3rem" title="Steckbrief">👤</button>
        </div>`;
    }).join('');

    setTimeout(() => {
      const label = document.getElementById('candidate-count-label');
      if (label) label.textContent = `${totalFiltered} Treffer`;
    }, 0);

    return rows + (hasMore ? `<button id="btn-show-more" class="btn btn-ghost" style="width:100%;margin-top:1rem">Mehr anzeigen</button>` : '');
  }

  function renderPartyRows() {
    if (!state.partyResults.length) return '<p class="text-muted" style="padding:1rem">Keine Parteien konfiguriert.</p>';
    return state.partyResults.map((pr, i) => {
      const pct = pr.avgMatch ?? 0;
      const label = pr.avgMatch != null ? `${pr.avgMatch}%` : '–';
      const medal = ['🥇', '🥈', '🥉'][i] || '';
      const cohClass = pr.cohesion >= 80 ? 'cohesion-high' : pr.cohesion >= 60 ? 'cohesion-mid' : 'cohesion-low';
      const cohLabel = pr.cohesion != null ? `Einigkeit: ${pr.cohesion}%` : '';
      const memberRows = pr.members.map(c => {
        const mr = state.results.find(r => r.candidate.id === c.id);
        const mpct = mr ? (mr.matchPercent ?? 0) : 0;
        const mlabel = mr && mr.matchPercent != null ? `${mr.matchPercent}%` : '–';
        return `
          <div class="result-row" data-candidate-id="${c.id}" style="padding:0.5rem 0.75rem;gap:0.5rem;margin-left:1rem">
            <span class="candidate-dot" style="background:${c.color};width:0.55rem;height:0.55rem"></span>
            <span style="font-size:0.82rem;color:var(--text);flex:0 0 auto;min-width:90px">${c.name}</span>
            <div class="result-bar-track">
              <div class="result-bar-fill" style="width:0%;background:${c.color}" data-pct="${mpct}"></div>
            </div>
            <span style="font-size:0.82rem;font-weight:700;color:var(--text)">${mlabel}</span>
          </div>`;
      }).join('');

      const delay = (i * 0.08).toFixed(2);
      return `
        <div class="card animate-in" style="margin-bottom:0.875rem;overflow:hidden;animation-delay:${delay}s">
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem 1rem">
            <span style="font-size:1rem;font-weight:700;color:var(--text-muted);width:1.5rem;text-align:center">${medal || i + 1}</span>
            <span class="candidate-dot" style="background:${pr.party.color};width:1rem;height:1rem;box-shadow:0 0 0 2px var(--surface), 0 0 0 3px ${pr.party.color}44"></span>
            <div style="flex:1">
              <div style="font-weight:800;font-size:1.05rem;color:var(--text);letter-spacing:-0.02em">${pr.party.name}</div>
              ${cohLabel ? `<div class="${cohClass}" style="font-size:0.75rem;font-weight:700">${cohLabel}</div>` : ''}
            </div>
            <div class="result-bar-track">
              <div class="result-bar-fill" style="width:0%;background:linear-gradient(90deg,${pr.party.color},${pr.party.color}cc)" data-pct="${pct}"></div>
            </div>
            <span style="font-size:1.1rem;font-weight:900;color:var(--text);min-width:3.5rem;text-align:right">${label}</span>
            <button class="party-row-toggle btn-icon" data-party-id="${pr.party.id}" style="font-size:0.75rem">▼</button>
          </div>
          <div id="party-members-${pr.party.id}" class="hidden" style="border-top:1px solid var(--border);padding:0.35rem 0;background:var(--surface-2)">
            ${memberRows}
          </div>
        </div>`;
    }).join('');
  }

  function renderCategoryTable() {
    const cats = Object.keys(state.categoryResults);
    if (!cats.length) return '';
    const cands = candidates();

    const headers = cats.map(cat => `<th>${cat}</th>`).join('');

    const rows = cands.map(c => {
      const cells = cats.map(cat => {
        const pct = state.categoryResults[cat][c.id];
        if (pct == null) return `<td class="cat-null">–</td>`;
        const cls = pct >= 70 ? 'cat-high' : pct >= 40 ? 'cat-mid' : 'cat-low';
        return `<td class="${cls}">${pct}%</td>`;
      }).join('');
      return `<tr><td class="cat-name"><span class="candidate-dot" style="background:${c.color}"></span>${c.name}</td>${cells}</tr>`;
    }).join('');

    return `<table class="cat-table"><thead><tr><th style="text-align:left">Kandidat:in</th>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  // ── Screen: Compare ────────────────────────────────────────────────
  function renderCompare(candidateId) {
    const candidate = candidates().find(c => c.id === candidateId);
    if (!candidate) return;
    const section = document.getElementById('screen-compare');
    const match = state.results.find(r => r.candidate.id === candidateId);
    const matchPct = match ? match.matchPercent : calculateMatch(candidate);
    const party = candidateParty(candidate);
    const color = party ? party.color : '#9CA3AF';

    const rows = questions().map(q => {
      const u = state.answers[q.id];
      const c = candidate.answers[q.id] ?? 3;
      const w = state.weights[q.id] === 2 ? 2 : 1;
      const skipped = u == null;
      const diff = skipped ? null : Math.abs(u - c);

      const uBarW = skipped ? 0 : Math.round(((u - 1) / 4) * 100);
      const cBarW = Math.round(((c - 1) / 4) * 100);

      const matchBadge = skipped
        ? `<span class="badge" style="background:var(--surface-2);color:var(--text-muted)">übersprungen</span>`
        : diff === 0
          ? `<span class="badge badge-success">Übereinstimmung</span>`
          : diff === 1
            ? `<span class="badge" style="background:var(--surface-2);color:var(--text-muted)">fast einig (Δ1)</span>`
            : `<span class="badge" style="background:var(--surface-2);color:var(--text-muted)">Differenz: ${diff}</span>`;

      const weightBadge = w === 2
        ? `<span class="badge badge-warning">×2 gewichtet</span>` : '';

      const poleLine = q.poleA
        ? `<div style="font-size:0.75rem;color:var(--text-light);margin-bottom:0.75rem;text-align:center;font-weight:600">
             <span style="color:var(--accent)">◀ ${q.poleA}</span>
             &nbsp;/&nbsp;
             <span style="color:var(--success)">${q.poleB} ▶</span>
           </div>` : '';

      return `
        <div class="card" style="padding:1.5rem;margin-bottom:1rem">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;margin-bottom:0.75rem">
            ${q.category ? `<span class="badge badge-accent">${q.category}</span>` : ''}
            <div style="display:flex;gap:0.35rem;flex-wrap:wrap;margin-left:auto">${matchBadge}${weightBadge}</div>
          </div>
          ${poleLine}
          <div style="display:flex;flex-direction:column;gap:0.75rem">
            <div style="display:flex;align-items:center;gap:0.75rem">
              <span style="font-size:0.8rem;color:var(--text-muted);width:3.5rem;flex-shrink:0">Du:</span>
              ${skipped
                ? `<span style="font-size:0.85rem;color:var(--text-light);font-style:italic">Übersprungen</span>`
                : `<div style="flex:1;height:10px;background:var(--surface-2);border-radius:9999px;overflow:hidden">
                     <div style="height:100%;width:${uBarW}%;background:var(--accent);border-radius:9999px"></div>
                   </div>
                   <span style="font-size:0.85rem;font-weight:700;color:var(--text);min-width:3.5rem;text-align:right">${u} ${u <= 2 ? '◀ A' : u >= 4 ? 'B ▶' : '○'}</span>`
              }
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem">
              <span style="font-size:0.8rem;font-weight:700;width:3.5rem;flex-shrink:0;color:${color}">${candidate.name.split(' ')[0]}:</span>
              <div style="flex:1;height:10px;background:var(--surface-2);border-radius:9999px;overflow:hidden">
                <div style="height:100%;width:${cBarW}%;background:${color};border-radius:9999px"></div>
              </div>
              <span style="font-size:0.85rem;font-weight:700;color:var(--text);min-width:3.5rem;text-align:right">${c} ${c <= 2 ? '◀ A' : c >= 4 ? 'B ▶' : '○'}</span>
            </div>
          </div>
          ${candidate.statements?.[q.id]
            ? `<p style="margin-top:1rem;font-size:0.85rem;color:var(--text-muted);font-style:italic;border-left:4px solid ${color};padding-left:0.8rem;line-height:1.4">${candidate.statements[q.id]}</p>`
            : ''}
        </div>`;
    }).join('');

    section.innerHTML = `
      <div class="screen-inner">
        <button id="btn-back-results" class="btn btn-ghost" style="margin-bottom:1.5rem;font-size:0.9rem">← Zurück zu Ergebnissen</button>
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;flex-wrap:wrap">
          <span class="candidate-dot" style="background:${color};width:1.25rem;height:1.25rem"></span>
          <h1 style="font-size:1.8rem;font-weight:900;color:var(--text);margin:0">
            Du vs. <span style="color:${color}">${candidate.name}</span>
          </h1>
          ${party ? partyBadgeHtml(candidate) : ''}
          ${matchPct != null ? `<span style="margin-left:auto;font-size:2rem;font-weight:900;color:${color}">${matchPct}%</span>` : ''}
        </div>
        <div>${rows}</div>
      </div>`;

    section.querySelector('#btn-back-results').addEventListener('click', () => showScreen('results'));
    // Animate candidate bars in compare
    section.querySelectorAll('.result-row[data-candidate-id]').forEach(row => {
      row.addEventListener('click', () => {
        renderCompare(row.dataset.candidateId); showScreen('compare');
      });
    });
  }

  // ── Screen: Profile ────────────────────────────────────────────────
  function renderProfile(candidateId) {
    const candidate = candidates().find(c => c.id === candidateId);
    if (!candidate) return;
    const section = document.getElementById('screen-profile');
    const party = candidateParty(candidate);
    const color = candidate.color || (party ? party.color : 'var(--accent)');

    // Answers Overview
    const answersHtml = questions().map(q => {
      const val = candidate.answers[q.id] ?? 3;
      const isImportant = candidate.importantQuestions?.includes(q.id);
      const dots = [1, 2, 3, 4, 5].map(v => {
        const activeClass = v === val ? (v <= 2 ? ' active-side-a' : v >= 4 ? ' active-side-b' : ' active-neutral') : '';
        return `<div class="mini-dot${activeClass}"></div>`;
      }).join('');

      return `
        <div class="answer-mini-card animate-fade-in">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <span style="font-size:0.75rem;font-weight:700;color:var(--text-muted)">${q.category || 'Allgemein'}</span>
            ${isImportant ? '<span class="profile-important-badge">Fokus</span>' : ''}
          </div>
          <div style="font-size:0.85rem;font-weight:600;margin:0.25rem 0">${q.poleA.substring(0, 40)}...</div>
          <div class="mini-scale">${dots}</div>
          ${isImportant && candidate.statements?.[q.id] ? `<div style="font-size:0.75rem;color:var(--text-light);font-style:italic;margin-top:0.5rem;border-top:1px solid var(--border);padding-top:0.5rem">"${candidate.statements[q.id]}"</div>` : ''}
        </div>`;
    }).join('');

    section.innerHTML = `
      <div class="screen-inner animate-fade-in">
        <button id="btn-profile-back" class="btn btn-ghost" style="margin-bottom:1.5rem">← Zurück</button>
        
        <div class="profile-header">
          <div class="profile-avatar" style="border-color:${color};color:${color}">${candidate.name[0]}</div>
          <div style="flex:1">
            <h1 style="font-size:2.5rem;font-weight:900;margin:0">${candidate.name}</h1>
            <div style="display:flex;align-items:center;gap:0.75rem;margin-top:0.5rem">
              ${party ? partyBadgeHtml(candidate) : ''}
              ${candidate.inCongress ? '<span class="badge badge-success">Sitz im Kongress</span>' : '<span class="badge" style="background:var(--surface-2);color:var(--text-muted)">Nicht im Kongress</span>'}
            </div>
          </div>
        </div>

        <div class="profile-intro card">${candidate.intro || 'Keine Beschreibung verfügbar.'}</div>

        <div class="profile-links">
          ${candidate.profileUrl ? `<a href="${candidate.profileUrl}" target="_blank" class="btn btn-primary">Era-Profil 🔗</a>` : ''}
          ${candidate.articleUrl ? `<a href="${candidate.articleUrl}" target="_blank" class="btn btn-ghost">Wahlprogramm 📝</a>` : ''}
        </div>

        <div class="profile-section-title">📊 Antwort-Übersicht</div>
        <div class="answers-grid">${answersHtml}</div>

        <div style="margin-top:3rem;text-align:center">
           <button id="btn-profile-compare" class="btn btn-primary" style="padding:1rem 3rem">Mit mir vergleichen →</button>
        </div>
      </div>`;

    section.querySelector('#btn-profile-back').addEventListener('click', () => showScreen('results'));
    section.querySelector('#btn-profile-compare').addEventListener('click', () => {
      renderCompare(candidateId);
      showScreen('compare');
    });
  }

  // ── Screen: Overview ───────────────────────────────────────────────
  function renderOverview() {
    let ovIdx = 0;

    function renderOvQuestion() {
      const qs = questions();
      const q = qs[ovIdx];
      const cands = candidates();
      const userAnswer = state.answers[q.id];

      const candidateCardsHtml = cands.map(c => {
        const val = c.answers[q.id] ?? 3;
        const barPct = Math.round(((val - 1) / 4) * 100);
        const party = candidateParty(c);
        const color = party ? party.color : '#9CA3AF';
        const statement = c.statements?.[q.id];
        const dirLabel = val <= 2 ? '◀ A' : val >= 4 ? 'B ▶' : '○';
        return `
          <div class="ov-cand-card card" style="border-left:4px solid ${color}">
            <div class="ov-cand-header">
              <span class="candidate-dot" style="background:${color}"></span>
              <span class="ov-cand-name">${c.name}</span>
              ${partyBadgeHtml(c)}
            </div>
            <div class="ov-cand-bar-row">
              <span style="font-size:0.75rem;color:var(--text-muted);width:2.5rem;flex-shrink:0">${dirLabel}</span>
              <div class="ov-cand-bar-track">
                <div class="ov-cand-bar-fill" style="width:${barPct}%;background:${color}"></div>
              </div>
              <span style="font-size:0.85rem;font-weight:700;color:${color};min-width:1rem;text-align:right">${val}</span>
            </div>
            ${statement
              ? `<p class="ov-cand-statement">${statement}</p>`
              : `<p class="ov-cand-no-statement">Keine Begründung angegeben.</p>`}
          </div>`;
      }).join('');

      const section = document.getElementById('screen-overview');
      section.innerHTML = `
        <div class="screen-inner slide-in-up">
          <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
            <div>
              <h1 style="font-size:2rem;font-weight:900;margin:0">Alle Einzelantworten</h1>
              <p class="text-muted">Vergleiche die Positionen aller Kandidat:innen im Detail.</p>
            </div>
            <button id="btn-ov-back-results" class="btn btn-primary">← Zurück zur Übersicht</button>
          </header>

          <div class="ov-nav-bar">
            <button id="btn-ov-prev" class="btn btn-ghost" ${ovIdx === 0 ? 'disabled' : ''}>← Zurück</button>
            <div class="ov-nav-counter">
              <span class="badge badge-accent">${q.category || 'Allgemein'}</span>
              <span>Frage ${ovIdx + 1} von ${qs.length}</span>
            </div>
            <button id="btn-ov-next" class="btn btn-ghost" ${ovIdx === qs.length - 1 ? 'disabled' : ''}>Weiter →</button>
          </div>

          <div class="card ov-question-card" style="padding:2rem;margin-bottom:2rem">
            <div class="ov-poles-row">
              <span style="color:var(--accent);font-weight:700">◀ ${q.poleA || ''}</span>
              <div class="ov-user-dots">
                ${[1,2,3,4,5].map(v => {
                  const active = userAnswer === v;
                  const side = v <= 2 ? 'var(--accent)' : v >= 4 ? 'var(--success)' : 'var(--text-muted)';
                  return `<div class="ov-user-dot${active ? ' ov-user-dot-active' : ''}" style="${active ? `background:${side};box-shadow:0 0 8px ${side}` : ''}"></div>`;
                }).join('')}
              </div>
              <span style="color:var(--success);font-weight:700">${q.poleB || ''} ▶</span>
            </div>
          </div>

          <div class="ov-candidates-grid">${candidateCardsHtml}</div>
        </div>`;

      section.querySelector('#btn-ov-back-results').addEventListener('click', () => {
        renderResults(); showScreen('results');
      });
      section.querySelector('#btn-ov-prev')?.addEventListener('click', () => {
        if (ovIdx > 0) { ovIdx--; renderOvQuestion(); }
      });
      section.querySelector('#btn-ov-next')?.addEventListener('click', () => {
        if (ovIdx < qs.length - 1) { ovIdx++; renderOvQuestion(); }
      });
    }

    renderOvQuestion();
  }

  // Exposure for inline onclick handlers
  window.WAHLERA_APP = {
    navigateToCandidate: (id) => {
      renderCompare(id);
      showScreen('compare');
    },
    navigateToProfile: (id) => {
      state.selectedCandidateId = id;
      renderProfile(id);
      showScreen('profile');
    }
  };

  // ── Start screen resume banner ─────────────────────────────────────
  function showResumeBanner(saved) {
    const banner = document.getElementById('resume-banner');
    if (!banner) return;
    const qNum = (saved.currentQuestion || 0) + 1;
    const total = questions().length;
    banner.innerHTML = `
      <div class="resume-banner" style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap">
        <span style="font-size:0.875rem;color:var(--accent);font-weight:600">
          ⏸ Fortschritt gespeichert — Frage ${qNum} von ${total}
        </span>
        <div style="display:flex;gap:0.5rem;margin-left:auto">
          <button id="btn-resume" class="btn btn-primary" style="font-size:0.82rem;padding:0.4rem 0.875rem">Weitermachen →</button>
          <button id="btn-discard" class="btn btn-ghost" style="font-size:0.82rem;padding:0.4rem 0.875rem">Neu starten</button>
        </div>
      </div>`;
    banner.classList.remove('hidden');

    banner.querySelector('#btn-resume').addEventListener('click', () => {
      state.answers = saved.answers || {};
      state.weights = saved.weights || {};
      state.currentQuestion = saved.currentQuestion || 0;
      renderQuestion(state.currentQuestion, 'initial');
      showScreen('quiz');
    });
    banner.querySelector('#btn-discard').addEventListener('click', () => {
      clearStorage();
      banner.classList.add('hidden');
    });
  }

  // ── Initialization ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const data = DATA();
    if (!data) {
      document.body.innerHTML = '<p style="padding:2rem;color:red">Fehler: data.js konnte nicht geladen werden.</p>';
      return;
    }

    // Dark mode
    initDarkMode();
    document.getElementById('btn-dark-toggle')?.addEventListener('click', toggleDarkMode);

    // Meta
    document.title = data.meta.title || 'WahlEra';
    document.querySelectorAll('.meta-title').forEach(el => { el.textContent = data.meta.title || 'WahlEra'; });
    document.querySelectorAll('.meta-election').forEach(el => { el.textContent = data.meta.election || ''; });
    document.querySelectorAll('.meta-description').forEach(el => { el.textContent = data.meta.description || ''; });

    // Start buttons
    document.getElementById('btn-start')?.addEventListener('click', () => {
      clearStorage();
      state.answers = {}; state.weights = {}; state.currentQuestion = 0;
      renderQuestion(0, 'initial');
      showScreen('quiz');
    });
    document.getElementById('btn-show-overview')?.addEventListener('click', () => {
      renderOverview(); showScreen('overview');
    });

    // URL share param → skip to results
    const shareParam = new URLSearchParams(location.search).get('s');
    if (shareParam) {
      const decoded = decodeShareState(shareParam);
      if (decoded) {
        state.answers = decoded.a;
        state.weights = decoded.w || {};
        computeAllResults();
        computePartyResults();
        computeCategoryResults();
        renderResults();
        showScreen('results', false);
        history.replaceState({ screen: 'results' }, '', '#results');
        return;
      }
    }

    // Hash routing
    const hash = location.hash.replace('#', '');
    if (hash === 'overview') {
      renderOverview(); showScreen('overview', false);
    } else {
      showScreen('start', false);
      history.replaceState({ screen: 'start' }, '', '#start');

      // localStorage resume
      const saved = loadFromStorage();
      if (saved && Object.keys(saved.answers || {}).length > 0) {
        showResumeBanner(saved);
      }
    }
  });

})();
