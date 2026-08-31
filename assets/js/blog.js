/* captmeelo.com — the only three things that genuinely need JS:
   theme persistence, index filter/search, TOC scroll-spy.
   Plus code-block chrome (label bar + copy), which has no server-side option. */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- theme toggle (initial paint is handled inline in <head>) --- */

  var themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- code blocks: label bar + copy ----------------------------- */

  // Label falls back to the Rouge language. A post can override it with a
  // kramdown IAL on the fence: {: data-file="inject.c"}
  document.querySelectorAll('.post-body div.highlighter-rouge').forEach(function (block) {
    var lang = (block.className.match(/language-([\w+-]+)/) || ['', ''])[1];
    if (lang === 'plaintext' || !lang) lang = 'text';

    var wrap = document.createElement('div');
    wrap.className = 'cb';

    var bar = document.createElement('div');
    bar.className = 'cb-bar';

    var name = document.createElement('span');
    name.className = 'cb-name';
    name.textContent = block.dataset.file || lang;

    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'cb-copy';
    copy.textContent = 'copy';

    bar.appendChild(name);
    bar.appendChild(copy);

    block.parentNode.insertBefore(wrap, block);
    wrap.appendChild(bar);
    wrap.appendChild(block);

    copy.addEventListener('click', function () {
      var text = block.textContent.replace(/\n+$/, '');
      var done = function (label) {
        copy.textContent = label;
        setTimeout(function () { copy.textContent = 'copy'; }, 1200);
      };
      try {
        navigator.clipboard.writeText(text).then(
          function () { done('copied'); },
          function () { done('failed'); }
        );
      } catch (e) {
        done('failed');
      }
    });
  });

  // Wide tables scroll inside their own box instead of the page.
  document.querySelectorAll('.post-body table').forEach(function (t) {
    var box = document.createElement('div');
    box.className = 'table-scroll';
    t.parentNode.insertBefore(box, t);
    box.appendChild(t);
  });

  /* ---------- TOC scroll-spy -------------------------------------------- */

  // Progressive: without this the TOC still works as plain anchor links.
  var toc = document.getElementById('toc');
  var heads = [].slice.call(document.querySelectorAll('.post-body h2[id]'));

  if (toc && heads.length) {
    var links = {};
    toc.querySelectorAll('a').forEach(function (a) {
      links[decodeURIComponent(a.hash.slice(1))] = a;
    });

    // "Which section am I in" is a geometry question — the last heading that
    // has passed the top of the viewport. A rAF-throttled scroll listener
    // answers it directly and, unlike an IntersectionObserver, never leaves a
    // long section with no highlight at all.
    var active = null;
    var mark = function () {
      var current = heads[0];
      heads.forEach(function (h) {
        if (h.getBoundingClientRect().top <= 80) current = h;
      });
      if (current === active) return;
      active = current;
      Object.keys(links).forEach(function (k) { links[k].classList.remove('act'); });
      var hit = links[current.id];
      if (hit) hit.classList.add('act');
    };

    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; mark(); });
    }, { passive: true });

    mark();
  }

  /* ---------- index: category pills + global search --------------------- */

  var list = document.getElementById('cards');
  var q = document.getElementById('q');
  if (!list || !q) return;

  var cards = [].slice.call(list.querySelectorAll('.card'));
  var pills = [].slice.call(document.querySelectorAll('#pills .pill'));
  var clearBtn = document.getElementById('q-clear');
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('empty');

  var cat = 'all';
  var bodiesRequested = false;

  function render() {
    var term = q.value.trim().toLowerCase();
    var shown = 0;

    cards.forEach(function (card) {
      // A non-empty query searches every post — the selected category must
      // NOT scope it. The category only applies when the box is empty.
      var hit = term
        ? card.dataset.s.indexOf(term) !== -1
        : cat === 'all' || (' ' + card.dataset.cats + ' ').indexOf(' ' + cat + ' ') !== -1;
      card.hidden = !hit;
      if (hit) shown++;
    });

    countEl.textContent = shown + (shown === 1 ? ' post' : ' posts') +
      (term ? ' matching "' + q.value.trim() + '"' : '');
    emptyEl.hidden = shown !== 0;
    clearBtn.hidden = !q.value;

    // Set pill state explicitly on every render so the highlight can never
    // drift out of sync with what is actually shown.
    pills.forEach(function (p) { p.classList.toggle('on', p.dataset.cat === cat); });
  }

  // Cards only carry title + description. Full post bodies come from
  // search.json, fetched on first interaction so the index stays light.
  function loadBodies() {
    if (bodiesRequested) return;
    bodiesRequested = true;
    fetch('/search.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var byUrl = {};
        data.forEach(function (d) { byUrl[d.u] = d.b; });
        cards.forEach(function (card) {
          var body = byUrl[card.dataset.url];
          if (body) card.dataset.s = card.dataset.s + ' ' + body;
        });
        render();
      })
      .catch(function () { /* titles + descriptions still searchable */ });
  }

  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      cat = p.dataset.cat;
      q.value = '';
      render();
    });
  });

  q.addEventListener('focus', loadBodies);
  q.addEventListener('input', function () {
    loadBodies();
    cat = 'all';
    render();
  });

  clearBtn.addEventListener('click', function () {
    q.value = '';
    q.focus();
    render();
  });

  render();
})();
