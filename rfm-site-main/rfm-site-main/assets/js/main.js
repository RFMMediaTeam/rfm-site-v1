/* Raja Faith Ministries — main.js
   Handles: nav, hero slider, scroll reveal, lightbox, forms, timeline tabs, popup */

(function () {
  'use strict';

  /* ---- Header scrolled state ---- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  toggle && toggle.addEventListener('click', () => document.body.classList.toggle('nav-open'));

  /* ---- Dropdowns (mobile: click to open) ---- */
  document.querySelectorAll('.nav-list .has-drop > .nav-trigger').forEach(t => {
    t.addEventListener('click', e => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        t.parentElement.classList.toggle('open');
      }
    });
  });

  /* Close mobile nav on link click */
  document.querySelectorAll('.nav-list a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 1024) document.body.classList.remove('nav-open');
    });
  });

  /* Mark active nav */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-list a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.replace(/^\//, '') === path) a.classList.add('active');
  });

  /* ---- Hero slider ---- */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dots button');
  if (slides.length > 1) {
    let idx = 0;
    let timer;
    const go = i => {
      slides[idx].classList.remove('active');
      dots[idx] && dots[idx].classList.remove('active');
      idx = (i + slides.length) % slides.length;
      slides[idx].classList.add('active');
      dots[idx] && dots[idx].classList.add('active');
    };
    const start = () => { timer = setInterval(() => go(idx + 1), 6000); };
    const stop = () => clearInterval(timer);
    dots.forEach((d, i) => d.addEventListener('click', () => { stop(); go(i); start(); }));
    start();
  }

  /* ---- Scroll reveal (opt-in via .reveal class only) ---- */
  const revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealables.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(el => {
      // If already in viewport at load, reveal immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('in');
      } else {
        io.observe(el);
      }
    });
  } else {
    revealables.forEach(el => el.classList.add('in'));
  }

  /* ---- Lightbox for galleries ---- */
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close">×</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Previous">‹</button>
    <img alt="" />
    <button class="lightbox-nav lightbox-next" aria-label="Next">›</button>
  `;
  document.body.appendChild(lightbox);
  const lbImg = lightbox.querySelector('img');
  let currentGallery = [], currentIdx = 0;
  const openLightbox = (list, i) => {
    currentGallery = list; currentIdx = i;
    lbImg.src = list[i];
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => { lightbox.classList.remove('open'); document.body.style.overflow = ''; };
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + currentGallery.length) % currentGallery.length;
    lbImg.src = currentGallery[currentIdx];
  });
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % currentGallery.length;
    lbImg.src = currentGallery[currentIdx];
  });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightbox.querySelector('.lightbox-prev').click();
    if (e.key === 'ArrowRight') lightbox.querySelector('.lightbox-next').click();
  });

  document.querySelectorAll('.gallery').forEach(gal => {
    const anchors = gal.querySelectorAll('a');
    const list = Array.from(anchors).map(a => a.getAttribute('href'));
    anchors.forEach((a, i) => {
      a.addEventListener('click', e => { e.preventDefault(); openLightbox(list, i); });
    });
  });

  /* ---- Timeline tabs (Media page) ---- */
  document.querySelectorAll('.timeline').forEach(tl => {
    const btns = tl.querySelectorAll('button');
    const panels = document.querySelectorAll('.timeline-panel');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.target);
        target && target.classList.add('active');
        // Re-bind lightbox for newly-shown gallery
        if (target) {
          const gal = target.querySelector('.gallery');
          if (gal) {
            const anchors = gal.querySelectorAll('a');
            const list = Array.from(anchors).map(a => a.getAttribute('href'));
            anchors.forEach((a, i) => {
              a.onclick = e => { e.preventDefault(); openLightbox(list, i); };
            });
          }
        }
      });
    });
  });

  /* ---- Form handling (client-side validation + fake submit) ---- */
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        const wrap = field.closest('.field');
        if (!field.value.trim() || (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value))) {
          wrap && wrap.classList.add('has-error');
          valid = false;
        } else {
          wrap && wrap.classList.remove('has-error');
        }
      });
      const status = form.querySelector('.form-status');
      if (!status) return;
      status.classList.remove('show', 'success', 'error');
      if (valid) {
        status.classList.add('show', 'success');
        status.textContent = form.dataset.success || 'Thank you! We will get back to you soon.';
        form.reset();
      } else {
        status.classList.add('show', 'error');
        status.textContent = form.dataset.error || 'Please fix the errors and try again.';
      }
    });
    form.querySelectorAll('input, select, textarea').forEach(f => {
      f.addEventListener('input', () => f.closest('.field') && f.closest('.field').classList.remove('has-error'));
    });
  });

  /* ---- Home popup (session-scoped) ---- */
  const modal = document.querySelector('#sunday-popup');
  if (modal && !sessionStorage.getItem('rfm-popup-seen')) {
    setTimeout(() => modal.classList.add('open'), 1500);
    modal.querySelectorAll('[data-close]').forEach(b =>
      b.addEventListener('click', () => {
        modal.classList.remove('open');
        sessionStorage.setItem('rfm-popup-seen', '1');
      })
    );
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.remove('open');
        sessionStorage.setItem('rfm-popup-seen', '1');
      }
    });
  }

  /* ---- QR reveal toggle (donations page) ---- */
  const qrToggle = document.querySelector('[data-qr-toggle]');
  const qrSection = document.querySelector('#qr-section');
  if (qrToggle && qrSection) {
    qrToggle.addEventListener('click', () => {
      qrSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
})();
