/* Reactielaag voor de conceptversie van de EKV Fast Lane website.
   - Opmerkingen worden in de browser van de lezer bewaard (localStorage).
   - "Verstuur" stuurt ze via Netlify Forms (formulier "opmerkingen") naar de beheerder.
   - Downloaden als .json/.txt en importeren van .json kan altijd, ook zonder Netlify. */
(function () {
  var KEY = 'ekv-site-opmerkingen-v1';
  var NAME_KEY = 'ekv-site-naam';
  var page = (location.pathname.split('/').pop() || 'index.html').replace(/\?.*$/, '') || 'index.html';
  var pageTitle = (document.querySelector('h1') || {}).textContent || document.title;
  pageTitle = pageTitle.trim();

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
  function getName() { try { return localStorage.getItem(NAME_KEY) || ''; } catch (e) { return ''; } }
  function setName(n) { try { localStorage.setItem(NAME_KEY, n); } catch (e) {} }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function fmt(ts) { var d = new Date(ts); return d.toLocaleDateString('nl-NL') + ' ' + d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }); }

  var comments = load();
  var active = false;

  /* 1. Onderdelen markeren waarop gereageerd kan worden */
  var SEL = 'body > div > header, section, article, main > div, aside, .step, details, blockquote, .doc, .row, .ms, .news, .term, .actor, footer';
  var blocks = Array.prototype.slice.call(document.querySelectorAll(SEL));
  blocks.forEach(function (el, i) {
    if (el.closest('.op-panel, .op-pop, .op-fab, .op-banner')) return;
    el.setAttribute('data-cid', page + ':' + (el.id || el.tagName.toLowerCase() + '-' + i));
  });
  function labelOf(el) {
    var h = el.querySelector('h1, h2, h3, summary, b');
    var t = (h && h.textContent) || el.getAttribute('aria-label') || el.textContent || '';
    t = t.replace(/\s+/g, ' ').trim();
    return t.length > 70 ? t.slice(0, 67) + '…' : t;
  }

  /* 2. Banner en knoppen */
  var banner = document.createElement('div');
  banner.className = 'op-banner';
  banner.innerHTML = 'Conceptversie ter bespreking. Klik op <b>Reageren</b> rechtsonder en daarna op een onderdeel om een opmerking te plaatsen.';
  document.body.insertBefore(banner, document.body.firstChild);

  var fab = document.createElement('div');
  fab.className = 'op-fab';
  fab.innerHTML = '<button type="button" class="op-mode" aria-pressed="false">Reageren</button><button type="button" class="op-open">Opmerkingen <span class="op-count"></span></button>';
  document.body.appendChild(fab);
  var modeBtn = fab.querySelector('.op-mode');
  var openBtn = fab.querySelector('.op-open');

  function setMode(on) {
    active = on;
    document.body.classList.toggle('op-active', on);
    modeBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    modeBtn.textContent = on ? 'Klik op een onderdeel…' : 'Reageren';
  }
  modeBtn.addEventListener('click', function () { if (!getName()) { openPanel(); flash('Vul eerst je naam in.', true); return; } setMode(!active); });

  /* 3. Klikken in reactiemodus */
  document.addEventListener('click', function (e) {
    if (!active) return;
    if (e.target.closest('.op-panel, .op-pop, .op-fab, .op-banner, .op-marker')) return;
    var el = e.target.closest('[data-cid]');
    if (!el) return;
    e.preventDefault(); e.stopPropagation();
    openPop(el, null);
  }, true);

  /* 4. Invoervenster */
  var pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function openPop(el, existing) {
    closePop();
    var r = el.getBoundingClientRect();
    pop = document.createElement('div');
    pop.className = 'op-pop';
    pop.innerHTML = '<h4>' + (existing ? 'Opmerking bewerken' : 'Nieuwe opmerking') + '</h4>' +
      '<span class="op-where">' + esc(pageTitle) + ' › ' + esc(labelOf(el)) + '</span>' +
      '<label for="op-text" style="font-size:13px;font-weight:700">Opmerking</label>' +
      '<textarea id="op-text"></textarea>' +
      '<div class="op-row"><button type="button" class="op-btn op-save">Bewaren</button><button type="button" class="op-btn sec op-cancel">Annuleren</button></div>';
    document.body.appendChild(pop);
    var top = window.scrollY + r.top + 8;
    var left = Math.min(window.scrollX + r.left + 8, window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 16);
    pop.style.top = top + 'px'; pop.style.left = Math.max(16, left) + 'px';
    var ta = pop.querySelector('textarea');
    if (existing) ta.value = existing.text;
    ta.focus();
    pop.querySelector('.op-cancel').onclick = closePop;
    pop.querySelector('.op-save').onclick = function () {
      var t = ta.value.trim();
      if (!t) { ta.focus(); return; }
      if (existing) { existing.text = t; existing.ts = Date.now(); existing.sent = false; }
      else comments.push({ id: uid(), cid: el.getAttribute('data-cid'), page: page, pageTitle: pageTitle, label: labelOf(el), text: t, naam: getName(), ts: Date.now(), sent: false, own: true });
      save(comments); closePop(); render(); setMode(false);
    };
  }

  /* 5. Markeringen bij onderdelen */
  var markerLayer = document.createElement('div');
  document.body.appendChild(markerLayer);
  function placeMarkers() {
    markerLayer.innerHTML = '';
    var groups = {};
    comments.filter(function (c) { return c.page === page; }).forEach(function (c) { (groups[c.cid] = groups[c.cid] || []).push(c); });
    Object.keys(groups).forEach(function (cid) {
      var el = document.querySelector('[data-cid="' + cid + '"]');
      if (!el) return;
      var r = el.getBoundingClientRect();
      var m = document.createElement('button');
      m.type = 'button';
      var others = groups[cid].every(function (c) { return !c.own; });
      m.className = 'op-marker' + (others ? ' op-other' : '');
      m.textContent = groups[cid].length;
      m.setAttribute('aria-label', groups[cid].length + ' opmerking(en) bij ' + labelOf(el));
      m.style.top = (window.scrollY + r.top - 10) + 'px';
      m.style.left = (window.scrollX + r.right - 34) + 'px';
      m.onclick = function () { openPanel('page'); highlight(cid); };
      markerLayer.appendChild(m);
    });
  }
  window.addEventListener('resize', placeMarkers);
  window.addEventListener('load', placeMarkers);

  /* 6. Zijpaneel */
  var panel = null, scope = 'page';
  function openPanel(sc) {
    if (sc) scope = sc;
    if (!panel) {
      panel = document.createElement('aside');
      panel.className = 'op-panel';
      panel.setAttribute('aria-label', 'Opmerkingen');
      document.body.appendChild(panel);
    }
    panel.hidden = false;
    renderPanel();
  }
  function closePanel() { if (panel) panel.hidden = true; }
  openBtn.addEventListener('click', function () { if (panel && !panel.hidden) closePanel(); else openPanel(); });

  function flash(msg, err) {
    var s = panel && panel.querySelector('.op-status');
    if (s) { s.textContent = msg; s.className = 'op-status' + (err ? ' err' : ''); }
  }
  function highlight(cid) {
    var el = document.querySelector('[data-cid="' + cid + '"]');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('op-flash');
    setTimeout(function () { el.classList.remove('op-flash'); }, 1600);
  }

  function renderPanel() {
    if (!panel || panel.hidden) return;
    var list = comments.slice().sort(function (a, b) { return a.ts - b.ts; });
    if (scope === 'page') list = list.filter(function (c) { return c.page === page; });
    var unsent = comments.filter(function (c) { return c.own && !c.sent; }).length;
    panel.innerHTML =
      '<header><h3>Opmerkingen</h3><button type="button" class="op-btn sec op-close">Sluiten</button></header>' +
      '<div class="op-body">' +
      '<div style="display:flex;flex-direction:column;gap:6px"><label for="op-naam" style="font-size:13px;font-weight:700">Je naam</label><input id="op-naam" type="text" placeholder="Voor- en achternaam" value="' + esc(getName()) + '"></div>' +
      '<div class="op-tabs"><button type="button" data-s="page" aria-pressed="' + (scope === 'page') + '">Deze pagina</button><button type="button" data-s="all" aria-pressed="' + (scope === 'all') + '">Alle pagina\'s (' + comments.length + ')</button></div>' +
      (list.length ? list.map(function (c) {
        return '<div class="op-item' + (c.own ? '' : ' op-other') + '" data-id="' + c.id + '">' +
          '<span class="op-meta">' + esc(c.naam || 'onbekend') + ' · ' + fmt(c.ts) + (c.own ? (c.sent ? ' · verstuurd' : ' · nog niet verstuurd') : ' · geïmporteerd') + '</span>' +
          '<a href="' + esc(c.page) + '" data-cid="" class="op-go" style="font-size:13px;font-weight:700;text-decoration:none">' + esc(c.pageTitle) + ' › ' + esc(c.label) + '</a>' +
          '<p>' + esc(c.text) + '</p>' +
          (c.own ? '<div class="op-row"><button type="button" class="op-btn sec op-edit">Bewerken</button><button type="button" class="op-btn del op-del">Verwijderen</button></div>' : '') +
          '</div>';
      }).join('') : '<p style="margin:0;font-size:15px;color:#676D71">Nog geen opmerkingen' + (scope === 'page' ? ' op deze pagina' : '') + '. Klik op <b>Reageren</b> en daarna op een onderdeel.</p>') +
      '</div>' +
      '<div class="op-foot">' +
      '<button type="button" class="op-btn op-send"' + (unsent ? '' : ' disabled style="opacity:.5;cursor:default"') + '>Verstuur ' + unsent + ' nieuwe opmerking(en)</button>' +
      '<div class="op-row"><button type="button" class="op-btn sec op-json">Download .json</button><button type="button" class="op-btn sec op-txt">Download .txt</button><label class="op-btn sec" style="display:inline-block">Importeer .json<input type="file" accept=".json,application/json" class="op-imp" hidden></label></div>' +
      '<span class="op-status" role="status"></span>' +
      '</div>';

    panel.querySelector('.op-close').onclick = closePanel;
    panel.querySelector('#op-naam').oninput = function (e) { setName(e.target.value.trim()); };
    Array.prototype.forEach.call(panel.querySelectorAll('.op-tabs button'), function (b) { b.onclick = function () { scope = b.getAttribute('data-s'); renderPanel(); }; });
    Array.prototype.forEach.call(panel.querySelectorAll('.op-item'), function (it) {
      var c = comments.filter(function (x) { return x.id === it.getAttribute('data-id'); })[0];
      var go = it.querySelector('.op-go');
      go.onclick = function (e) { if (c.page === page) { e.preventDefault(); highlight(c.cid); } };
      var ed = it.querySelector('.op-edit');
      if (ed) ed.onclick = function () {
        if (c.page !== page) { location.href = c.page; return; }
        var el = document.querySelector('[data-cid="' + c.cid + '"]'); if (el) { el.scrollIntoView({ block: 'center' }); openPop(el, c); }
      };
      var del = it.querySelector('.op-del');
      if (del) {
        del.onclick = function () {
          if (del.getAttribute('data-sure')) { comments = comments.filter(function (x) { return x.id !== c.id; }); save(comments); render(); }
          else { del.setAttribute('data-sure', '1'); del.textContent = 'Zeker weten?'; }
        };
      }
    });
    panel.querySelector('.op-send').onclick = send;
    panel.querySelector('.op-json').onclick = function () { download('opmerkingen-ekv-site-' + slug() + '.json', JSON.stringify(comments.filter(function (c) { return c.own; }), null, 2), 'application/json'); };
    panel.querySelector('.op-txt').onclick = function () { download('opmerkingen-ekv-site-' + slug() + '.txt', asText(), 'text/plain'); };
    panel.querySelector('.op-imp').onchange = importFile;
  }

  function slug() { return (getName() || 'anoniem').toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
  function asText() {
    var byPage = {};
    comments.forEach(function (c) { (byPage[c.pageTitle] = byPage[c.pageTitle] || []).push(c); });
    return 'Opmerkingen EKV Fast Lane website (concept)\nVan: ' + (getName() || 'onbekend') + '\n\n' +
      Object.keys(byPage).map(function (p) {
        return '## ' + p + '\n' + byPage[p].map(function (c) { return '- [' + c.label + '] ' + c.text + ' (' + (c.naam || '') + ', ' + fmt(c.ts) + ')'; }).join('\n');
      }).join('\n\n') + '\n';
  }
  function download(name, content, type) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: type + ';charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    flash('Bestand gedownload: ' + name);
  }
  function importFile(e) {
    var f = e.target.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var inc = JSON.parse(rd.result); var n = 0;
        if (!Array.isArray(inc)) throw new Error('geen lijst');
        inc.forEach(function (c) {
          if (!c || !c.id || !c.text || comments.some(function (x) { return x.id === c.id; })) return;
          comments.push({ id: String(c.id), cid: String(c.cid || ''), page: String(c.page || 'index.html'), pageTitle: String(c.pageTitle || ''), label: String(c.label || ''), text: String(c.text), naam: String(c.naam || ''), ts: Number(c.ts) || Date.now(), sent: true, own: false });
          n++;
        });
        save(comments); render(); flash(n + ' opmerking(en) geïmporteerd.');
      } catch (err) { flash('Dit bestand kon niet worden gelezen. Kies een .json uit "Download .json".', true); }
    };
    rd.readAsText(f);
  }

  /* 7. Versturen via Netlify Forms */
  function send() {
    var todo = comments.filter(function (c) { return c.own && !c.sent; });
    if (!todo.length) return;
    if (!getName()) { flash('Vul eerst je naam in.', true); return; }
    flash('Bezig met versturen…');
    var chain = Promise.resolve();
    var ok = 0;
    todo.forEach(function (c) {
      chain = chain.then(function () {
        var body = new URLSearchParams({ 'form-name': 'opmerkingen', naam: c.naam || getName(), pagina: c.pageTitle + ' (' + c.page + ')', onderdeel: c.label, opmerking: c.text, tijd: new Date(c.ts).toISOString(), id: c.id }).toString();
        return fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
          .then(function (r) { if (!r.ok) throw new Error(r.status); c.sent = true; ok++; });
      });
    });
    chain.then(function () { save(comments); render(); flash(ok + ' opmerking(en) verstuurd. Dank je!'); })
      .catch(function () { save(comments); render(); flash('Versturen lukte niet (' + ok + ' van ' + todo.length + ' verstuurd). Gebruik "Download .txt" en mail het bestand.', true); });
  }

  function render() {
    var own = comments.filter(function (c) { return c.page === page; }).length;
    openBtn.querySelector('.op-count').textContent = comments.length ? '(' + comments.length + ')' : '';
    placeMarkers(); renderPanel();
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closePop(); if (active) setMode(false); } });
  render();

  /* Nieuwsbriefformulier op home: alleen demo in de conceptversie */
  var nb = document.getElementById('nb-form');
  if (nb) nb.addEventListener('submit', function (e) {
    e.preventDefault();
    nb.hidden = true;
    var t = document.getElementById('nb-thanks'); if (t) t.hidden = false;
  });
})();
