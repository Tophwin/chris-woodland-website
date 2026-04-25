/* ============================================================
   CHRIS WOODLAND — Main JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Work page: orange radial reveal ---------- */
  const revealEl = document.getElementById('page-reveal');

  if (revealEl && document.body.classList.contains('work-page-body')) {
    const fromNav     = sessionStorage.getItem('workTransition') === 'true';
    const fromAbout   = sessionStorage.getItem('fromAboutToWork') === 'true';
    const fromContact = sessionStorage.getItem('fromContactToWork') === 'true';
    sessionStorage.removeItem('workTransition');
    sessionStorage.removeItem('fromAboutToWork');
    sessionStorage.removeItem('fromContactToWork');

    const contactBtn = document.querySelector('.nav-dark .nav-cta');

    // If arriving from About or Contact the button is already cream — snap instantly.
    // Otherwise play the normal cyan → cream sweep.
    const alreadyCream = fromAbout || fromContact;
    if (alreadyCream) {
      contactBtn?.classList.add('contact-instant');
    }
    const fillBtn     = (delay) => {
      if (!alreadyCream) setTimeout(() => contactBtn?.classList.add('contact-fill'), delay);
    };
    const loadContent = (delay) => setTimeout(() => document.body.classList.add('loaded'), delay);
    const setOrange   = (delay) => setTimeout(() => document.body.classList.add('orange-ready'), delay);

    if (fromNav) {
      // Arriving via nav click: orange fill already covered screen — skip radial
      // and show content immediately in the same frame to prevent any jitter.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          revealEl.style.display = 'none';
          // Add both classes together so there's no gap between the orange
          // background being ready and content starting to animate in.
          document.body.classList.add('orange-ready', 'loaded');
          fillBtn(200);
        });
      });
    } else {
      const workLink = document.querySelector('.nav-links a[href="work.html"]');
      if (workLink) {
        const rect = workLink.getBoundingClientRect();
        revealEl.style.setProperty('--reveal-x', `${Math.round(rect.left + rect.width  / 2)}px`);
        revealEl.style.setProperty('--reveal-y', `${Math.round(rect.top  + rect.height / 2)}px`);
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          revealEl.classList.add('go');
          fillBtn(700);
          // Fire loaded and orange-ready together once the radial has fully
          // expanded (~0.9s). This stops content animating in under a still-moving
          // overlay, eliminating the pop/jitter on direct-URL arrivals.
          loadContent(1050);
          setOrange(1050);
        });
      });
    }
  }

  /* ---------- About page: P3-inspired slash transition ---------- */
  const p3Overlay = document.getElementById('p3-overlay');

  if (p3Overlay && document.body.classList.contains('about-page-body')) {
    const fromNav  = sessionStorage.getItem('aboutTransition') === 'true';
    const fromWork = sessionStorage.getItem('fromWorkToAbout') === 'true';
    sessionStorage.removeItem('aboutTransition');
    sessionStorage.removeItem('fromWorkToAbout');

    const contactBtn = document.querySelector('.nav-dark .nav-cta');

    // Contact button behavior:
    //   - From work : button is already cream — snap instantly, no animation
    //   - Otherwise : animate cyan → cream after the slices start sweeping off
    if (fromWork) {
      contactBtn?.classList.add('contact-instant');
    }

    // Desktop: slice stagger finishes at ~890ms (0.65s + 0.24s).
    // Mobile:  clip-path finishes at ~800ms (0.8s).
    const p3Mobile = window.matchMedia('(max-width: 900px)').matches;

    // Kick the sweep off immediately.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        p3Overlay.classList.add('go');
      });
    });

    // Fire 'loaded' once the transition finishes so content cascades in
    // after the wipe, not underneath it.
    setTimeout(() => document.body.classList.add('loaded'), p3Mobile ? 820 : 900);

    // Animate the contact button only when NOT from work
    if (!fromWork) {
      setTimeout(() => contactBtn?.classList.add('contact-fill'), 380);
    }

    // Retire the overlay once all slices/clip are gone
    setTimeout(() => document.body.classList.add('cyan-ready'), p3Mobile ? 900 : 960);

  } else if (!revealEl) {
    /* ---------- Page load animation (home / other pages) ---------- */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('loaded');
      });
    });
  }

  /* ---------- Home page: Contact button animates back to cyan on arrival from work ---------- */
  const navCta = document.querySelector('.nav-links .nav-cta');
  const fromWork = sessionStorage.getItem('homeTransition') === 'true';
  sessionStorage.removeItem('homeTransition');

  if (navCta && fromWork) {
    // Snap to cream immediately (matches the work page end state)
    navCta.classList.add('cream-snap');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Retreat right→left, revealing cyan beneath
        navCta.classList.remove('cream-snap');
        navCta.classList.add('cream-retreat');
      });
    });
  }

  /* ---------- About page exit transition (P3 slash, fires on every page) ---------- */
  document.querySelectorAll('a[href="about.html"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const current = window.location.pathname.split('/').pop() || 'index.html';
      if (current === 'about.html') return; // already here — navigate normally

      e.preventDefault();
      const href = this.getAttribute('href');

      // Lock a dark backdrop on the current page nav so it doesn't
      // float bare while the cyan slices slash across the screen.
      const currentNav = document.querySelector('.nav');
      if (currentNav) currentNav.classList.add('scrolled');

      // Flag for the about page so it can decide about button animation
      sessionStorage.setItem('aboutTransition', 'true');
      if (current === 'work.html') sessionStorage.setItem('fromWorkToAbout', 'true');

      // Build the P3 slash overlay on the fly.
      // Overlay itself is transparent; the 4 cyan slices inside provide the
      // colour. Visibility is controlled by a diagonal clip-path on the
      // overlay which starts at zero area (pinned to the left edge) and
      // expands rightward — so NOTHING is visible until the animation
      // actually starts, eliminating the blue rectangle flash entirely.
      // Same 4-layer structure as the entry overlay, so both halves match.
      const overlay = document.createElement('div');
      overlay.className = 'p3-overlay p3-exit';
      for (let i = 0; i < 4; i++) {
        const slice = document.createElement('div');
        slice.className = 'p3-slice';
        overlay.appendChild(slice);
      }
      document.body.appendChild(overlay);

      // Desktop uses the original translateX/stagger (0.6s + 0.24s ≈ 870ms).
      // Mobile uses the clip-path sweep (0.8s ≈ 820ms).
      const p3Mobile = window.matchMedia('(max-width: 900px)').matches;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.add('go');
          setTimeout(() => { window.location.href = href; }, p3Mobile ? 820 : 870);
        });
      });
    });
  });

  /* ---------- Work page exit transition (fires on every page) ---------- */
  document.querySelectorAll('a[href="work.html"]').forEach(link => {
    link.addEventListener('click', function (e) {
      // Already on the work page — let browser navigate normally
      const current = window.location.pathname.split('/').pop() || 'index.html';
      if (current === 'work.html') return;

      e.preventDefault();
      const href = this.getAttribute('href');

      // Get click origin for the radial burst
      const rect = this.getBoundingClientRect();
      const originX = Math.round(rect.left + rect.width  / 2);
      const originY = Math.round(rect.top  + rect.height / 2);

      // Lock a dark backdrop on the current page's nav so it doesn't
      // float bare above the orange fill during the exit transition
      const currentNav = document.querySelector('.nav');
      if (currentNav) currentNav.classList.add('scrolled');

      // Create & inject the orange fill overlay
      const overlay = document.createElement('div');
      overlay.className = 'page-exit-overlay';
      overlay.style.setProperty('--exit-x', `${originX}px`);
      overlay.style.setProperty('--exit-y', `${originY}px`);
      document.body.appendChild(overlay);

      // Trigger expand
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.add('go');
          // Tell work.html it's arriving via nav so it skips the circle
          sessionStorage.setItem('workTransition', 'true');
          // If leaving about or contact, button is already cream — skip the fill animation
          if (current === 'about.html')   sessionStorage.setItem('fromAboutToWork', 'true');
          if (current === 'contact.html') sessionStorage.setItem('fromContactToWork', 'true');
          // Navigate once orange covers the screen
          setTimeout(() => { window.location.href = href; }, 820);
        });
      });
    });
  });

  /* ---------- Nav: scroll effect ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Nav: mobile toggle ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Cycling text ---------- */
  const items = document.querySelectorAll('.cycling-text');
  if (items.length) {
    let current = 0;

    const cycle = () => {
      const prev = items[current];
      current = (current + 1) % items.length;
      const next = items[current];

      prev.classList.add('exit');
      prev.classList.remove('active');

      setTimeout(() => {
        prev.classList.remove('exit');
      }, 500);

      next.classList.add('active');
    };

    // Init first item
    items[0].classList.add('active');
    setInterval(cycle, 2200);
  }

  /* ---------- Lightbox ---------- */
  const lightbox       = document.getElementById('lightbox');
  const lightboxIframe = document.getElementById('lightbox-iframe');
  const lightboxClose  = document.getElementById('lightbox-close');
  const lightboxBack   = document.getElementById('lightbox-backdrop');

  const openLightbox = (card) => {
    const type    = card.dataset.videoType;
    const videoId = card.dataset.videoId;
    const url     = card.dataset.videoUrl;

    if (type === 'youtube' && videoId && videoId !== 'YOUR_VIDEO_ID') {
      lightboxIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      // Trigger animation on next frame
      requestAnimationFrame(() => lightbox.classList.add('open'));
      lightboxClose.focus();
    } else if (type === 'link' && url) {
      window.open(url, '_blank', 'noopener');
    } else {
      // Placeholder card — do nothing
      console.log('No video URL set for this card yet.');
    }
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    setTimeout(() => {
      lightbox.hidden = true;
      lightboxIframe.src = '';
      document.body.style.overflow = '';
    }, 300);
  };

  if (lightbox) {
    // Card clicks
    document.querySelectorAll('.work-page-card').forEach(card => {
      card.addEventListener('click', () => openLightbox(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(card);
        }
      });
    });

    // Close triggers
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxBack.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  /* ---------- Scroll-reveal (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // fire once
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ---------- Work/About → home: flag so home page animates the button cream→cyan ---------- */
  document.querySelectorAll('a[href="index.html"]').forEach(link => {
    link.addEventListener('click', function () {
      const current = window.location.pathname.split('/').pop() || 'index.html';
      // Both work and about pages have the button in cream state —
      // tell home to play the retreat animation.
      // Work, About, and Contact all have the button in cream state —
      // tell home to play the cream → cyan retreat animation on arrival.
      if (current === 'work.html' || current === 'about.html' || current === 'contact.html') {
        sessionStorage.setItem('homeTransition', 'true');
      }
    });
  });

  /* ---------- Footer: inject flex-break so Instagram + LinkedIn stay
     together on row 2 on mobile (otherwise LinkedIn wraps alone). ---------- */
  document.querySelectorAll('.footer-links').forEach(nav => {
    const instagram = nav.querySelector('a[href*="instagram"]');
    if (instagram && !instagram.previousElementSibling?.classList.contains('footer-links-break')) {
      const br = document.createElement('span');
      br.className = 'footer-links-break';
      br.setAttribute('aria-hidden', 'true');
      instagram.parentNode.insertBefore(br, instagram);
    }
  });

  /* ---------- Active nav link ---------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

});
