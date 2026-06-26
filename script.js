'use strict';

const ACC = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#d8b878';
const hexToRgb = h => {
  h = h.replace('#','');
  if (h.length===3) h = h.split('').map(c=>c+c).join('');
  const n = parseInt(h,16);
  return [(n>>16)&255,(n>>8)&255,n&255];
};

/* ── Preloader ── */
function runPreloader() {
  const pre = document.getElementById('preloader');
  const bar = document.getElementById('preloader-bar');
  const count = document.getElementById('preloader-count');
  if (!pre) return;
  const start = performance.now(), dur = 1400;
  const ease = t => 1 - Math.pow(1-t, 3);
  const step = now => {
    const p = Math.min(1, (now-start)/dur);
    const pct = Math.round(ease(p)*100);
    if (count) count.textContent = pct;
    if (bar) bar.style.width = pct+'%';
    if (p < 1) { requestAnimationFrame(step); }
    else {
      pre.style.transform = 'translateY(-100%)';
      pre.style.opacity = '0';
      pre.style.pointerEvents = 'none';
      setTimeout(() => { pre.style.setProperty('display','none','important'); }, 900);
    }
  };
  requestAnimationFrame(step);
}

/* ── Custom cursor ── */
function setupCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia && window.matchMedia('(hover:none)').matches) return;
  let rx=0, ry=0, tx=0, ty=0, seen=false, scale=1;
  window.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    if (!seen) { seen=true; rx=tx; ry=ty; dot.style.opacity='1'; ring.style.opacity='1'; }
    dot.style.transform = `translate3d(${tx}px,${ty}px,0)`;
  });
  const loop = () => {
    rx += (tx-rx)*0.18; ry += (ty-ry)*0.18;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0) scale(${scale})`;
    requestAnimationFrame(loop);
  };
  loop();
  document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { scale=1.9; ring.style.background='color-mix(in oklab,var(--acc) 16%,transparent)'; ring.style.borderColor='transparent'; });
    el.addEventListener('mouseleave', () => { scale=1; ring.style.background='transparent'; ring.style.borderColor='var(--acc)'; });
  });
}

/* ── Spotlight glow ── */
function setupSpotlight() {
  const g = document.getElementById('glow');
  if (!g) return;
  window.addEventListener('mousemove', e => {
    g.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  });
}

/* ── Particle field canvas ── */
function setupField() {
  const canvas = document.getElementById('field-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W=0, H=0, pts=[];
  const mouse = { x:-9999, y:-9999 };
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  const resize = () => {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W*dpr; canvas.height = H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const target = Math.min(150, Math.round((W*H)/11000));
    pts = Array.from({length:target}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*.28, vy: (Math.random()-.5)*.28,
      r: Math.random()*1.6+.6
    }));
  };
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x=e.clientX; mouse.y=e.clientY; });
  window.addEventListener('mouseout', () => { mouse.x=-9999; mouse.y=-9999; });

  const R=150, R2=R*R, LINK=128, LINK2=LINK*LINK;
  const draw = () => {
    const rgb = hexToRgb(ACC());
    ctx.clearRect(0,0,W,H);
    const mx=mouse.x, my=mouse.y;
    for (const p of pts) {
      if (!reduce) { p.x+=p.vx; p.y+=p.vy; }
      if (p.x<0||p.x>W) p.vx*=-1;
      if (p.y<0||p.y>H) p.vy*=-1;
      const dx=p.x-mx, dy=p.y-my, d2=dx*dx+dy*dy;
      if (d2<R2) {
        const f=(1-Math.sqrt(d2)/R)*1.6, inv=1/(Math.sqrt(d2)||1);
        p.x+=dx*inv*f; p.y+=dy*inv*f;
      }
    }
    for (let i=0;i<pts.length;i++) {
      for (let j=i+1;j<pts.length;j++) {
        const a=pts[i],b=pts[j], dx=a.x-b.x, dy=a.y-b.y, d2=dx*dx+dy*dy;
        if (d2<LINK2) {
          const o=(1-d2/LINK2)*0.5;
          ctx.strokeStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${o*0.5})`;
          ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    for (const p of pts) {
      const dx=p.x-mx, dy=p.y-my, d2=dx*dx+dy*dy, near=d2<R2;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283);
      ctx.fillStyle = near ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.95)` : `rgba(220,212,195,.5)`;
      ctx.fill();
      if (near) {
        const o=(1-Math.sqrt(d2)/R)*0.7;
        ctx.strokeStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${o})`;
        ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(mx,my); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  };
  draw();
}

/* ── Parallax blobs ── */
function setupParallax() {
  let tx=0, ty=0, cx=0, cy=0;
  window.addEventListener('mousemove', e => {
    tx = (e.clientX/window.innerWidth-.5)*2;
    ty = (e.clientY/window.innerHeight-.5)*2;
  });
  const layers = [
    { el: document.querySelector('.blob-a'), d:160 },
    { el: document.querySelector('.blob-b'), d:-130 },
    { el: document.querySelector('.bg-grid'), d:60 },
    { el: document.getElementById('field-canvas'), d:40 },
    { el: document.querySelector('.bg-gradient'), d:24 },
  ];
  const loop = () => {
    cx += (tx-cx)*0.055; cy += (ty-cy)*0.055;
    layers.forEach(b => { if (b.el) b.el.style.translate = `${cx*b.d}px ${cy*b.d}px`; });
    requestAnimationFrame(loop);
  };
  loop();
}

/* ── Portrait particle effect ── */
function setupPortrait() {
  const wrap = document.getElementById('portrait-wrap');
  const canvas = document.getElementById('portrait-canvas');
  if (!wrap || !canvas) return;
  const ctx = canvas.getContext('2d');
  const hint = document.getElementById('portrait-hint');
  const label = document.getElementById('portrait-label');
  let W=0, H=0, particles=[], ready=false;
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  const mouse = { x:-9999, y:-9999 };
  let hover=0, target=0, t=0;

  const img = new Image();

  const build = () => {
    W = wrap.clientWidth; H = wrap.clientHeight;
    if (!W||!H) return;
    canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    const off = document.createElement('canvas');
    off.width=W; off.height=H;
    const octx = off.getContext('2d');
    const ir=img.width/img.height, cr=W/H;
    let dw,dh,dx,dy;
    if (ir>cr) { dh=H; dw=H*ir; dx=(W-dw)/2; dy=0; }
    else { dw=W; dh=W/ir; dx=0; dy=(H-dh)*0.10; }
    octx.drawImage(img,dx,dy,dw,dh);
    const step = W<320?5:4;
    const data = octx.getImageData(0,0,W,H).data;
    particles = [];
    for (let y=0;y<H;y+=step) {
      for (let x=0;x<W;x+=step) {
        const i=(y*W+x)*4;
        if (data[i+3]<40) continue;
        const ang=Math.random()*Math.PI*2, rad=(0.4+Math.random()*0.8)*Math.max(W,H);
        particles.push({ tx:x, ty:y, r:data[i], g:data[i+1], b:data[i+2],
          x:W/2+Math.cos(ang)*rad, y:H/2+Math.sin(ang)*rad,
          ph:Math.random()*Math.PI*2, sp:0.6+Math.random()*0.9 });
      }
    }
    ready=true;
  };

  img.onload = build;
  img.src = 'assets/firli-portrait.jpg';
  window.addEventListener('resize', build);

  wrap.addEventListener('mouseenter', () => { target=1; });
  wrap.addEventListener('mouseleave', () => { target=0; mouse.x=-9999; mouse.y=-9999; });
  wrap.addEventListener('mousemove', e => {
    const r=wrap.getBoundingClientRect();
    mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top;
  });

  const draw = () => {
    requestAnimationFrame(draw);
    if (!ready) return;
    t+=0.016; hover+=(target-hover)*0.07;
    if (hint) hint.style.opacity = String(Math.max(0,1-hover*2.2));
    if (label) { label.style.opacity=String(Math.max(0,(hover-.55)/.45)); label.style.transform=`translateY(${(1-hover)*8}px)`; }
    ctx.clearRect(0,0,W,H);
    const rgb=hexToRgb(ACC()), RR=46, RR2=RR*RR;
    for (const p of particles) {
      const wob=(1-hover)*26+1.5;
      const hx=p.tx+Math.cos(t*p.sp+p.ph)*wob*0.5;
      const hy=p.ty+Math.sin(t*p.sp+p.ph)*wob*0.5;
      const destX=p.tx+(p.x-p.tx)*(1-hover);
      const destY=p.ty+(p.y-p.ty)*(1-hover);
      let gx=destX*(1-hover)+hx*hover;
      let gy=destY*(1-hover)+hy*hover;
      const dx=gx-mouse.x, dy=gy-mouse.y, d2=dx*dx+dy*dy;
      if (d2<RR2) { const d=Math.sqrt(d2)||1, f=(1-d/RR); gx+=(dx/d)*f*18; gy+=(dy/d)*f*18; }
      p.x+=(gx-p.x)*0.16; p.y+=(gy-p.y)*0.16;
      const alpha=0.25+hover*0.75;
      const mr=Math.round(p.r*hover+rgb[0]*(1-hover));
      const mg=Math.round(p.g*hover+rgb[1]*(1-hover));
      const mb=Math.round(p.b*hover+rgb[2]*(1-hover));
      ctx.fillStyle=`rgba(${mr},${mg},${mb},${alpha})`;
      const s=1.4+(1-hover)*0.8;
      ctx.fillRect(p.x,p.y,s,s);
    }
  };
  draw();
}

/* ── Typing animation ── */
function setupTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const roles = ['Fullstack Software Developer', 'System Architects', 'Backend Engineers', 'Teams & products'];
  let roleIdx=0, typed='', del=false;
  const tick = () => {
    const full = roles[roleIdx % roles.length];
    if (!del) {
      const next = full.slice(0, typed.length+1);
      typed=next; el.textContent=typed;
      if (next===full) { del=true; setTimeout(tick,1700); return; }
      setTimeout(tick,65);
    } else {
      const next = typed.slice(0,-1);
      typed=next; el.textContent=typed;
      if (next==='') { del=false; roleIdx++; setTimeout(tick,280); return; }
      setTimeout(tick,32);
    }
  };
  setTimeout(tick,600);
}

/* ── Kinetic text ── */
function setupKinetic() {
  document.querySelectorAll('[data-kinetic]').forEach(box => {
    const words = box.textContent.trim().split(/\s+/);
    box.textContent='';
    words.forEach((w,i) => {
      const wrap=document.createElement('span');
      wrap.style.cssText='display:inline-block;overflow:hidden;vertical-align:top';
      const inner=document.createElement('span');
      inner.textContent=w;
      inner.style.cssText=`display:inline-block;transform:translateY(115%);transition:transform .85s cubic-bezier(.22,.85,.2,1);transition-delay:${i*55}ms`;
      wrap.appendChild(inner);
      box.appendChild(wrap);
      box.appendChild(document.createTextNode(' '));
    });
    if (!('IntersectionObserver' in window)) {
      box.querySelectorAll('span > span').forEach(s => { s.style.transform='translateY(0)'; });
      return;
    }
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          box.querySelectorAll('span > span').forEach(s => { s.style.transform='translateY(0)'; });
          io.unobserve(box);
        }
      });
    }, { threshold:0.35 });
    io.observe(box);
  });
}

/* ── Scroll reveal ── */
function setupReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => { el.classList.add('visible'); });
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const el=en.target;
        const d=el.getAttribute('data-delay')||0;
        el.style.transitionDelay=d+'ms';
        el.classList.add('visible');
        io.unobserve(el);
      }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
}

/* ── Nav responsive ── */
function setupNav() {
  const nav = document.querySelector('.nav-links');
  if (!nav) return;
  const apply = () => { nav.style.display = window.innerWidth>=760 ? 'flex' : 'none'; };
  apply();
  window.addEventListener('resize', apply);
}

/* ── Project card 3D tilt + image slider + link ── */
function setupProjectCards() {
  const cards = document.querySelectorAll('.pcard');

  cards.forEach(card => {
    const inner = card.querySelector('.pcard-inner');
    const imgs  = card.querySelectorAll('.pcard-img');
    const dots  = card.querySelectorAll('.pcard-dots span');
    const cta   = card.querySelector('.pcard-cta');
    const href  = card.dataset.href;
    let current = 0, timer = null;

    /* ── Link behaviour ── */
    if (href) {
      card.style.cursor = 'pointer';
      if (cta) cta.textContent = 'Visit site ↗';
      card.addEventListener('click', e => {
        if (e.target.closest('.pcard-dots')) return;
        window.open(href, '_blank', 'noopener');
      });
    } else {
      if (cta) { cta.textContent = 'View project'; }
      card.style.cursor = 'default';
    }

    /* ── 3D tilt ── */
    card.addEventListener('mousemove', e => {
      const rect = inner.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      inner.style.transform = `
        perspective(900px)
        rotateY(${x * 10}deg)
        rotateX(${-y * 7}deg)
        translateY(-10px)
        scale(1.015)
      `;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = '';
      clearInterval(timer);
      timer = null;
    });

    /* ── Image slider (multi-image cards only) ── */
    if (imgs.length <= 1 || dots.length === 0) return;

    const goTo = idx => {
      imgs[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (idx + imgs.length) % imgs.length;
      imgs[current].classList.add('active');
      dots[current].classList.add('active');
    };

    dots.forEach((dot, i) => dot.addEventListener('click', e => {
      e.stopPropagation();
      clearInterval(timer);
      goTo(i);
      timer = setInterval(() => goTo(current + 1), 2200);
    }));

    card.addEventListener('mouseenter', () => {
      if (timer) return;
      timer = setInterval(() => goTo(current + 1), 2200);
    });
  });

  /* ── Featured card link ── */
  const featured = document.querySelector('.project-featured[data-href]');
  if (featured) {
    const href = featured.dataset.href;
    featured.style.cursor = 'pointer';
    featured.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      window.open(href, '_blank', 'noopener');
    });
  }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  runPreloader();
  setupCursor();
  setupSpotlight();
  setupField();
  setupParallax();
  setupPortrait();
  setupTyping();
  setupKinetic();
  setupReveal();
  setupNav();
  setupProjectCards();
});
