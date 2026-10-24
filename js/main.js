(function(){
  "use strict";

  var C = window.INVITATION || {};
  var doc = document.documentElement;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animate = hasGSAP && !reduceMotion;
  var isSmall = window.matchMedia('(max-width: 767px)').matches;
  var pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  window.__inviteReady = true;
  if(!hasGSAP) doc.classList.add('no-anim');
  if(hasGSAP) gsap.registerPlugin(ScrollTrigger);

  function $(sel, root){ return (root || document).querySelector(sel); }
  function $$(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- Config binding: every event fact comes from js/config.js ---------- */
  function cfg(path){
    return path.split('.').reduce(function(o, k){ return o == null ? undefined : o[k]; }, C);
  }
  $$('[data-i]').forEach(function(el){
    var v = cfg(el.getAttribute('data-i'));
    if(typeof v === 'string') el.textContent = v;
  });
  if(C.venue){
    $('#mapsLink').href = C.venue.mapsUrl;
    var frame = $('#mapFrame');
    if(frame.getAttribute('src') !== C.venue.embedUrl) frame.src = C.venue.embedUrl;
  }
  if(C.verse){
    $('#verseText').textContent = C.verse.text;
    $('#verseRef').textContent = C.verse.reference;
  }

  /* ---------- Botanical linework (generated so every sprig can be stroke-drawn) ---------- */
  function leaf(x, y, rot, len, w){
    var d = 'M0 0C' + w + ' ' + (-len * .3) + ' ' + (w * .6) + ' ' + (-len * .8) + ' 0 ' + (-len) +
            'C' + (-w * .6) + ' ' + (-len * .8) + ' ' + (-w) + ' ' + (-len * .3) + ' 0 0Z';
    return '<path class="lf" d="' + d + '" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')"/>';
  }
  // Rotation that turns an upward-pointing leaf to follow direction (tx, ty)
  function heading(tx, ty){ return Math.atan2(tx, -ty) * 180 / Math.PI; }

  function wreathMarkup(){
    var cx = 150, cy = 158, r = 104, out = '';
    function pt(a){ var t = a * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; }
    var s = pt(100), e = pt(250);
    out += '<path class="lf arc" d="M' + s[0].toFixed(1) + ' ' + s[1].toFixed(1) + 'A' + r + ' ' + r + ' 0 0 1 ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) + '"/>';
    out += '<path class="lf arc" d="M' + (300 - s[0]).toFixed(1) + ' ' + s[1].toFixed(1) + 'A' + r + ' ' + r + ' 0 0 0 ' + (300 - e[0]).toFixed(1) + ' ' + e[1].toFixed(1) + '"/>';
    var i = 0;
    for(var a = 108; a <= 246; a += 10.5, i++){
      var p = pt(a), t = a * Math.PI / 180;
      var rot = heading(-Math.sin(t), Math.cos(t)) + (i % 2 ? 40 : -40);
      var len = 21 - (a - 108) / 138 * 8;
      out += leaf(p[0], p[1], rot, len, len * .4);
      out += leaf(300 - p[0], p[1], -rot, len, len * .4);
    }
    out += '<path class="lf ribbon" d="M132 260C140 268 160 268 168 260M150 265c-8 6-13 13-11 22M150 265c8 6 13 13 11 22"/>';
    out += '<path class="lf cross" d="M150 28v42M138 41h24"/>';
    return out;
  }

  function sprigMarkup(){
    var pts = [], n = 24, out = '';
    for(var i = 0; i <= n; i++){
      var t = i / n;
      pts.push([34 + 16 * Math.sin(t * 2.6), 196 - t * 186]);
    }
    out += '<path class="stem" d="M' + pts.map(function(p){ return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + '"/>';
    for(var j = 3; j < n; j += 2){
      var p = pts[j], q = pts[j + 1];
      var base = heading(q[0] - p[0], q[1] - p[1]);
      var side = (j - 3) / 2 % 2 ? 1 : -1;
      var len = 26 * (1 - j / n * .55);
      out += leaf(p[0], p[1], base + side * 50, len, len * .38);
    }
    var tip = pts[n], pre = pts[n - 1];
    out += leaf(tip[0], tip[1], heading(tip[0] - pre[0], tip[1] - pre[1]), 13, 5);
    [[6, 10], [12, -9], [18, 8]].forEach(function(b){
      var bp = pts[b[0]];
      out += '<circle class="berry" cx="' + (bp[0] + b[1]).toFixed(1) + '" cy="' + (bp[1] - 4).toFixed(1) + '" r="1.8"/>';
    });
    return '<svg viewBox="0 0 100 200">' + out + '</svg>';
  }

  var sprig = sprigMarkup();
  $$('.sprig').forEach(function(el){ el.innerHTML = sprig; });

  var dividerSVG = '<svg viewBox="0 0 220 22"><path class="draw" d="M2 11H92"/><path class="draw" d="M218 11H128"/>' +
    '<path class="draw" d="M110 1v20M103 7h14"/></svg>';
  $$('.divider').forEach(function(el){ el.innerHTML = dividerSVG; });

  /* ---------- Warm bokeh ---------- */
  if(!reduceMotion){
    $$('[data-bokeh]').forEach(function(box){
      var n = parseInt(box.getAttribute('data-bokeh'), 10);
      if(isSmall) n = Math.ceil(n * .5);
      for(var i = 0; i < n; i++){
        var s = document.createElement('span');
        var size = 8 + Math.random() * 54;
        s.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;' +
          '--d:' + (10 + Math.random() * 12).toFixed(1) + 's;--delay:' + (-Math.random() * 20).toFixed(1) + 's;' +
          '--dx:' + (Math.random() * 60 - 30).toFixed(0) + 'px;--dy:' + (-20 - Math.random() * 50).toFixed(0) + 'px;' +
          '--o1:' + (.1 + Math.random() * .2).toFixed(2) + ';--o2:' + (.35 + Math.random() * .45).toFixed(2);
        box.appendChild(s);
      }
    });
  }

  /* ---------- Stroke-draw helpers ---------- */
  function prepDraw(paths){
    paths.forEach(function(p){
      var len = 1000;
      try{ len = Math.ceil(p.getTotalLength()) + 1; }catch(e){}
      p.style.strokeDasharray = len + ' ' + len;
      p.style.strokeDashoffset = len;
    });
    return paths;
  }

  /* ---------- Opening sequence ---------- */
  var intro = $('#intro');
  var outside = [$('#nav'), $('#main'), $('.footer')];
  var introSeen = doc.classList.contains('intro-seen');
  var introTl = null, exiting = false;

  function setInert(on){ outside.forEach(function(el){ el.inert = on; }); }

  function buildIntro(){
    var wreath = $('#introWreath');
    wreath.innerHTML = wreathMarkup();
    intro.setAttribute('tabindex', '-1');
    intro.focus({preventScroll:true});
    doc.classList.add('lock');
    setInert(true);

    if(!animate){
      // Reduced motion: present the finished card immediately, no choreography
      if(hasGSAP) gsap.set('.intro-inner > *, .intro-mono, .intro-skip', {opacity:1});
      else $$('.intro-inner > *, .intro-mono, .intro-skip').forEach(function(el){ el.style.opacity = 1; });
      return;
    }

    var arcs = prepDraw($$('.arc, .ribbon', wreath));
    var leaves = prepDraw($$('.lf:not(.arc):not(.ribbon):not(.cross)', wreath));
    var cross = prepDraw($$('.cross', wreath));

    introTl = gsap.timeline({delay:.25});
    introTl
      .to('.intro-skip', {opacity:1, duration:.6}, 0)
      .set('.intro-wreath', {opacity:1}, 0)
      .to(arcs, {strokeDashoffset:0, duration:1.8, ease:'power2.inOut'}, .1)
      .to(leaves, {strokeDashoffset:0, duration:.7, ease:'power1.out', stagger:.03}, .45)
      .to(cross, {strokeDashoffset:0, duration:1, ease:'power2.out'}, 1.3)
      .fromTo('.intro-mono', {opacity:0, letterSpacing:'.6em'}, {opacity:1, letterSpacing:'.16em', duration:1.4, ease:'power3.out'}, 1.2)
      .fromTo('.intro-eyebrow', {opacity:0, y:12}, {opacity:1, y:0, duration:.9, ease:'power3.out'}, 1.8)
      .set('.intro-names', {opacity:1}, 2)
      .fromTo('.intro-names .mask > span', {yPercent:115}, {yPercent:0, duration:1.25, ease:'power4.out', stagger:.14}, 2)
      .fromTo('.intro-verse', {opacity:0, y:12}, {opacity:1, y:0, duration:1, ease:'power2.out'}, 2.7)
      .fromTo('.intro-enter', {opacity:0, y:14}, {opacity:1, y:0, duration:.9, ease:'power3.out'}, 3);
  }

  function exitIntro(){
    if(exiting) return;
    exiting = true;
    try{ sessionStorage.setItem('ap-intro', '1'); }catch(e){}
    if(introTl) introTl.kill();
    doc.classList.remove('lock');
    setInert(false);

    function done(){
      intro.classList.add('gone');
      intro.setAttribute('aria-hidden', 'true');
      $('#heroTitle').setAttribute('tabindex', '-1');
      $('#heroTitle').focus({preventScroll:true});
      if(hasGSAP) ScrollTrigger.refresh();
    }

    if(!animate){ done(); heroIn(); return; }

    gsap.timeline({onComplete:done})
      .to('.intro-inner', {opacity:0, y:-30, duration:.6, ease:'power2.in'})
      .to('.intro-skip', {opacity:0, duration:.3}, 0)
      .fromTo(intro, {clipPath:'inset(0% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 100% 0%)', duration:1.3, ease:'power4.inOut'}, .35)
      .add(heroIn, .65);
  }

  $('#introEnter').addEventListener('click', exitIntro);
  $('#introSkip').addEventListener('click', exitIntro);
  intro.addEventListener('keydown', function(e){
    if(e.key === 'Escape') exitIntro();
    if(e.key === 'Tab'){
      // Keep focus inside the opening dialog
      var f = [$('#introEnter'), $('#introSkip')];
      if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[1].focus(); }
      else if(!e.shiftKey && document.activeElement === f[1]){ e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- Hero entrance ---------- */
  function heroIn(){
    var framePath = $$('.arch-frame .draw');
    var flourish = $$('.flourish .draw');
    var heroSprig = $$('.sprig-hero path');

    if(!animate){
      if(hasGSAP) gsap.set('[data-hero], [data-hero-name]', {opacity:1});
      return;
    }
    prepDraw(framePath.concat(flourish, heroSprig));

    var img = $('.hero-portrait .arch img');
    gsap.timeline()
      .fromTo('.hero-portrait .arch', {clipPath:'inset(100% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:1.6, ease:'power4.inOut'}, 0)
      .fromTo(img, {scale:1.35}, {scale:1, duration:2.2, ease:'power3.out'}, 0)
      .to(framePath, {strokeDashoffset:0, duration:2.2, ease:'power2.inOut'}, .6)
      .to(heroSprig, {strokeDashoffset:0, duration:1, ease:'power1.out', stagger:.04}, 1.2)
      .fromTo('.hero .eyebrow', {opacity:0, y:20}, {opacity:1, y:0, duration:1, ease:'power3.out'}, .5)
      .fromTo('[data-hero-name]', {opacity:1, yPercent:115}, {yPercent:0, duration:1.3, ease:'power4.out', stagger:.12}, .7)
      .set('.flourish', {opacity:1}, 1.2)
      .to(flourish, {strokeDashoffset:0, duration:1.2, ease:'power2.inOut', stagger:.1}, 1.2)
      .fromTo('.hero-tagline, .hero-meta, .scroll-cue', {opacity:0, y:18}, {opacity:1, y:0, duration:1, ease:'power3.out', stagger:.15}, 1.4)
      .add(function(){
        // Slow Ken Burns breathing on the portrait
        gsap.to(img, {scale:1.08, xPercent:-1.5, duration:16, ease:'sine.inOut', yoyo:true, repeat:-1});
      });
  }

  if(introSeen || !hasGSAP){
    intro.classList.add('gone');
    intro.setAttribute('aria-hidden', 'true');
    heroIn();
  } else {
    buildIntro();
  }

  /* ---------- Scroll storytelling ---------- */
  if(!animate) $$('[data-img-reveal]').forEach(function(el){ el.classList.add('revealed'); });
  if(animate){
    gsap.utils.toArray('[data-reveal]').forEach(function(el){
      gsap.from(el, {opacity:0, y:36, duration:1.1, ease:'power3.out',
        scrollTrigger:{trigger:el, start:'top 88%', once:true}});
    });

    gsap.utils.toArray('[data-reveal-stagger]').forEach(function(el){
      gsap.from(el.children, {opacity:0, y:40, duration:1, ease:'power3.out', stagger:.14,
        scrollTrigger:{trigger:el, start:'top 85%', once:true}});
    });

    gsap.utils.toArray('[data-img-reveal]').forEach(function(el){
      var media = $('.frame-img, .g-open', el) || el;
      var img = $('img', media);
      var caption = $('figcaption', el);
      var tl = gsap.timeline({scrollTrigger:{trigger:el, start:'top 86%', once:true},
        onComplete:function(){
          if(img) gsap.set(img, {clearProps:'transform'});
          el.classList.add('revealed');
        }});
      tl.fromTo(media, {clipPath:'inset(16% 12% 16% 12%)', opacity:0},
        {clipPath:'inset(0% 0% 0% 0%)', opacity:1, duration:1.5, ease:'power4.out'});
      if(img) tl.fromTo(img, {scale:1.25}, {scale:1, duration:1.9, ease:'power3.out'}, 0);
      if(caption) tl.from(caption, {opacity:0, y:12, duration:.9, ease:'power2.out'}, .6);
    });

    // Fine gold strokes draw themselves as they arrive
    $$('svg').filter(function(svg){
      return $('.draw', svg) && !svg.closest('.hero, .intro');
    }).forEach(function(svg){
      var paths = prepDraw($$('.draw', svg));
      gsap.to(paths, {strokeDashoffset:0, duration:1.6, ease:'power2.inOut', stagger:.15,
        scrollTrigger:{trigger:svg, start:'top 90%', once:true}});
    });

    // Botanical sprigs: stem first, then leaves unfurl, then berries
    $$('.sprig').filter(function(s){ return !s.closest('.hero'); }).forEach(function(s){
      var stem = prepDraw($$('.stem', s));
      var leaves = prepDraw($$('.lf', s));
      var berries = $$('.berry', s);
      gsap.timeline({scrollTrigger:{trigger:s, start:'top 92%', once:true}})
        .to(stem, {strokeDashoffset:0, duration:1.4, ease:'power2.inOut'})
        .to(leaves, {strokeDashoffset:0, duration:.8, ease:'power1.out', stagger:.06}, .3)
        .from(berries, {opacity:0, scale:0, transformOrigin:'50% 50%', duration:.5, stagger:.1}, 1);
    });

    // Hairline seams between sections
    $$('.section').forEach(function(sec){
      gsap.fromTo(sec, {'--seam':0}, {'--seam':1, ease:'none',
        scrollTrigger:{trigger:sec, start:'top 95%', end:'top 45%', scrub:true}});
    });

    // Verse illuminates word by word as it is read
    var verse = $('#verseText');
    verse.innerHTML = verse.textContent.trim().split(/\s+/).map(function(w){
      return '<span class="w">' + w.replace(/[&<>]/g, function(c){ return {'&':'&amp;', '<':'&lt;', '>':'&gt;'}[c]; }) + '</span>';
    }).join(' ');
    gsap.fromTo($$('.w', verse), {opacity:.14}, {opacity:1, ease:'none', stagger:.1,
      scrollTrigger:{trigger:verse, start:'top 82%', end:'bottom 52%', scrub:.6}});

    // Closing decorations fade gracefully as the story ends
    gsap.to('[data-fade-out], .closing .bokeh', {opacity:0, y:-30, ease:'none',
      scrollTrigger:{trigger:'.closing', start:'top 25%', end:'bottom bottom', scrub:true}});

    // Parallax depth — desktop only; phones keep a calm, static layout
    gsap.matchMedia().add('(min-width: 861px)', function(){
      $$('[data-parallax]').forEach(function(el){
        var speed = parseFloat(el.getAttribute('data-parallax'));
        var section = el.closest('section');
        gsap.to(el, {yPercent:-speed * 100, ease:'none',
          scrollTrigger:{trigger:section, start:section.id === 'home' ? 'top top' : 'top bottom', end:'bottom top', scrub:true}});
      });
    });
  }

  /* ---------- Navigation ---------- */
  var nav = $('#nav');
  var navToggle = $('#navToggle');
  var navLinks = $('#navLinks');
  var progress = $('#scrollProgress');

  function setMenu(open){
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navLinks.classList.toggle('open', open);
    doc.classList.toggle('lock', open);
  }
  navToggle.addEventListener('click', function(){
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', navLinks).forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && navLinks.classList.contains('open')){ setMenu(false); navToggle.focus(); }
  });

  var ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var max = doc.scrollHeight - window.innerHeight;
      nav.classList.toggle('scrolled', window.scrollY > 40);
      progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  if('IntersectionObserver' in window){
    var linkFor = {};
    $$('a', navLinks).forEach(function(a){ linkFor[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        $$('a', navLinks).forEach(function(a){ a.classList.remove('active'); a.removeAttribute('aria-current'); });
        var a = linkFor[entry.target.id];
        a.classList.add('active');
        a.setAttribute('aria-current', 'true');
      });
    }, {rootMargin:'-45% 0px -50% 0px'});
    Object.keys(linkFor).forEach(function(id){ var s = document.getElementById(id); if(s) spy.observe(s); });
  }

  /* ---------- Gallery lightbox ---------- */
  var lb = $('#lightbox');
  var lbImg = $('#lbImg');
  var lbCaption = $('#lbCaption');
  var shots = $$('.g-open').map(function(btn){
    var img = $('img', btn);
    var cap = $('figcaption', btn.closest('figure'));
    return {src:img.getAttribute('src'), alt:img.alt, w:img.getAttribute('width'), h:img.getAttribute('height'),
      caption:cap.textContent.replace(/^\s*\d+\s*/, '').trim()};
  });
  var current = 0, lastFocus = null;

  function paint(i){
    var s = shots[i];
    lbImg.src = s.src; lbImg.alt = s.alt;
    lbImg.width = s.w; lbImg.height = s.h;
    lbCaption.textContent = s.caption + '  ·  ' + (i + 1) + ' / ' + shots.length;
  }
  function show(i, dir){
    current = (i + shots.length) % shots.length;
    if(!animate || !dir){ paint(current); return; }
    gsap.to(lbImg, {opacity:0, x:-dir * 40, duration:.22, ease:'power2.in', onComplete:function(){
      paint(current);
      gsap.fromTo(lbImg, {opacity:0, x:dir * 40}, {opacity:1, x:0, duration:.5, ease:'power3.out'});
    }});
  }
  function openLb(i){
    lastFocus = document.activeElement;
    lb.hidden = false;
    doc.classList.add('lock');
    show(i, 0);
    if(animate){
      gsap.fromTo(lb, {opacity:0}, {opacity:1, duration:.4});
      gsap.fromTo(lbImg, {opacity:0, scale:.94}, {opacity:1, scale:1, duration:.6, ease:'power3.out'});
    }
    $('#lbClose').focus();
  }
  function closeLb(){
    function finish(){ lb.hidden = true; doc.classList.remove('lock'); if(lastFocus) lastFocus.focus(); }
    if(animate) gsap.to(lb, {opacity:0, duration:.3, onComplete:finish}); else finish();
  }

  $$('.g-open').forEach(function(btn){
    btn.addEventListener('click', function(){ openLb(parseInt(btn.getAttribute('data-index'), 10)); });
  });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', function(){ show(current - 1, -1); });
  $('#lbNext').addEventListener('click', function(){ show(current + 1, 1); });
  lb.addEventListener('click', function(e){ if(e.target === lb) closeLb(); });
  lb.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeLb();
    else if(e.key === 'ArrowLeft') show(current - 1, -1);
    else if(e.key === 'ArrowRight') show(current + 1, 1);
    else if(e.key === 'Tab'){
      var f = $$('button', lb);
      var first = f[0], last = f[f.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
  var touchX = null;
  lb.addEventListener('touchstart', function(e){ touchX = e.touches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', function(e){
    if(touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if(Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    touchX = null;
  });

  /* ---------- Countdown ---------- */
  var startAt = new Date(C.event.start).getTime();
  var endAt = new Date(C.event.end).getTime();
  var unitEls = {};
  $$('[data-unit]').forEach(function(el){ unitEls[el.getAttribute('data-unit')] = el; });
  var shown = {};
  var timerId = null;

  function pad(n){ return n < 10 ? '0' + n : String(n); }

  function setUnit(key, value){
    var txt = pad(value), box = unitEls[key];
    if(shown[key] === txt) return;
    var first = shown[key] === undefined;
    shown[key] = txt;
    if(!animate || first || document.hidden){ box.innerHTML = '<span>' + txt + '</span>'; return; }
    // Settle any roll still in flight (e.g. frames were throttled), then roll the new digits up from below
    while(box.children.length > 1) box.removeChild(box.firstElementChild);
    var old = box.firstElementChild;
    gsap.killTweensOf(old);
    gsap.set(old, {yPercent:0});
    var next = document.createElement('span');
    next.textContent = txt;
    box.appendChild(next);
    gsap.to([old, next], {yPercent:-100, duration:.6, ease:'power3.inOut', onComplete:function(){
      if(old.parentNode) old.parentNode.removeChild(old);
      gsap.set(next, {yPercent:0});
    }});
  }

  function finishTimer(msg){
    $('#timer').hidden = true;
    $('.script-line').hidden = true;
    var done = $('#timerDone');
    done.textContent = msg;
    done.hidden = false;
    clearInterval(timerId);
  }

  function tick(){
    var now = Date.now();
    if(now >= endAt){ finishTimer('Thank you for celebrating with us'); $('.cal-actions').hidden = true; return; }
    if(now >= startAt){ finishTimer('The celebration has begun!'); return; }
    var diff = startAt - now;
    setUnit('days', Math.floor(diff / 86400000));
    setUnit('hours', Math.floor(diff % 86400000 / 3600000));
    setUnit('minutes', Math.floor(diff % 3600000 / 60000));
    setUnit('seconds', Math.floor(diff % 60000 / 1000));
  }
  tick();
  timerId = setInterval(tick, 1000);

  /* ---------- Add to calendar (.ics download + Google Calendar link) ---------- */
  function utcStamp(ms){ return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function icsEscape(s){ return String(s).replace(/\\/g, '\\\\').replace(/[,;]/g, '\\$&').replace(/\n/g, '\\n'); }

  var calTitle = C.event.title + ' — ' + C.couple.groom + ' & ' + C.couple.bride;
  var calLocation = C.venue.name + ', ' + C.venue.city;

  $('#gcalLink').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(calTitle) +
    '&dates=' + utcStamp(startAt) + '/' + utcStamp(endAt) +
    '&details=' + encodeURIComponent(C.calendar.description) +
    '&location=' + encodeURIComponent(calLocation);

  $('#icsBtn').addEventListener('click', function(){
    var ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Reception//Arun and Priyadharshini//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:wedding-reception-arun-priyadharshini-2026@invitation',
      'DTSTAMP:' + utcStamp(Date.now()),
      'DTSTART:' + utcStamp(startAt),
      'DTEND:' + utcStamp(endAt),
      'SUMMARY:' + icsEscape(calTitle),
      'DESCRIPTION:' + icsEscape(C.calendar.description),
      'LOCATION:' + icsEscape(calLocation),
      'URL:' + C.venue.mapsUrl,
      'BEGIN:VALARM',
      'TRIGGER:-PT3H',
      'ACTION:DISPLAY',
      'DESCRIPTION:' + icsEscape(calTitle),
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    var url = URL.createObjectURL(new Blob([ics], {type:'text/calendar;charset=utf-8'}));
    var a = document.createElement('a');
    a.href = url;
    a.download = C.calendar.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
  });

  /* ---------- Share the invitation (native share sheet, else copy the link) ---------- */
  var shareUrl = C.shareUrl || location.href.split('#')[0];
  var shareText = 'You are invited to the ' + C.event.title + ' of ' + C.couple.short + ' — ' +
    C.event.dateLabel + ', ' + C.event.timeLabel + ', ' + C.venue.name + ', ' + C.venue.city + '.';
  var shareNote = $('#shareNote');

  $('#shareBtn').addEventListener('click', function(){
    if(navigator.share){
      navigator.share({title: C.couple.short + ' — ' + C.event.title, text: shareText, url: shareUrl}).catch(function(){});
      return;
    }
    var copied = navigator.clipboard ? navigator.clipboard.writeText(shareText + ' ' + shareUrl) : Promise.reject();
    copied.then(function(){ shareNote.textContent = 'Invitation link copied — paste it to share.'; })
      .catch(function(){ shareNote.textContent = shareUrl; });
  });

  /* ---------- Background music (only when config.music names a file) ---------- */
  var musicBtn = $('#musicBtn');
  var audio = $('#bgMusic');
  if(C.music){
    audio.src = C.music;
    audio.addEventListener('loadedmetadata', function(){ musicBtn.hidden = false; });
    musicBtn.addEventListener('click', function(){
      if(audio.paused){
        audio.play().then(function(){
          musicBtn.classList.add('playing');
          musicBtn.setAttribute('aria-pressed', 'true');
          musicBtn.setAttribute('aria-label', 'Pause background music');
        }).catch(function(){});
      } else {
        audio.pause();
        musicBtn.classList.remove('playing');
        musicBtn.setAttribute('aria-pressed', 'false');
        musicBtn.setAttribute('aria-label', 'Play background music');
      }
    });
  }

  /* ---------- Soft gold glow that follows the cursor (desktop only) ---------- */
  if(animate && pointerFine){
    var glow = $('#cursorGlow');
    var gx = gsap.quickTo(glow, 'x', {duration:.8, ease:'power3'});
    var gy = gsap.quickTo(glow, 'y', {duration:.8, ease:'power3'});
    window.addEventListener('mousemove', function(e){
      glow.classList.add('on');
      gx(e.clientX); gy(e.clientY);
    }, {passive:true});
    document.addEventListener('mouseleave', function(){ glow.classList.remove('on'); });
  }

})();
