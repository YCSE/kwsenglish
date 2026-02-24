/* ═══════════════════════════════════════════════════════════
   김우석영어학원 — Main JavaScript
   Scroll animations, counter, carousel, lightbox, nav,
   particles, parallax, tilt, magnetic buttons
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── NAV: scroll state + active section ─── */
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = navLinks.querySelectorAll('a');

  let lastScrollY = 0;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('nav--scrolled', y > 60);
    lastScrollY = y;
    updateActiveNav();
  }

  function updateActiveNav() {
    let current = '';
    sections.forEach(function (section) {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── Hamburger toggle ─── */
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('is-open');
    navLinks.classList.toggle('is-open');
  });

  navAnchors.forEach(function (a) {
    a.addEventListener('click', function () {
      hamburger.classList.remove('is-open');
      navLinks.classList.remove('is-open');
    });
  });

  /* ═══════════════════════════════════════════════════════════
     HERO PARTICLE SYSTEM
     Floating crimson particles on the hero section
     ═══════════════════════════════════════════════════════════ */
  (function initParticles() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'hero__particles';
    canvas.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;';
    hero.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 50;
    var animId;

    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Particle() {
      this.reset();
    }
    Particle.prototype.reset = function () {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.3 - 0.15;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.fadeSpeed = Math.random() * 0.003 + 0.001;
      this.growing = Math.random() > 0.5;
    };
    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.growing) {
        this.opacity += this.fadeSpeed;
        if (this.opacity >= 0.5) this.growing = false;
      } else {
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0.05) this.reset();
      }

      if (this.x < -10 || this.x > canvas.width + 10 ||
          this.y < -10 || this.y > canvas.height + 10) {
        this.reset();
      }
    };
    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      // Sparkle: pulse opacity for twinkling effect
      var sparkle = Math.sin(Date.now() * 0.003 + this.x * 0.5) * 0.15 + 0.85;
      var finalOpacity = this.opacity * sparkle;
      ctx.fillStyle = 'rgba(255, 255, 255, ' + finalOpacity + ')';
      ctx.fill();
      // Glow halo
      if (this.size > 1.5) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (finalOpacity * 0.15) + ')';
        ctx.fill();
      }
    };

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    // Draw connection lines between nearby particles
    function drawConnections() {
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            var lineOpacity = (1 - dist / 120) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + lineOpacity + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) {
        p.update();
        p.draw();
      });
      drawConnections();
      animId = requestAnimationFrame(animate);
    }
    animate();

    // Pause when not visible
    var heroObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!animId) animate();
      } else {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }, { threshold: 0.1 });
    heroObserver.observe(hero);
  })();

  /* ═══════════════════════════════════════════════════════════
     PARALLAX SCROLL EFFECTS
     Hero bg, section labels, feature card numbers
     ═══════════════════════════════════════════════════════════ */
  (function initParallax() {
    var heroBg = document.querySelector('.hero__bg-img');
    var heroContent = document.querySelector('.hero__content');
    var sectionLabels = document.querySelectorAll('.section-label__num');
    var featureNumbers = document.querySelectorAll('.feature-card__number');

    var ticking = false;

    function updateParallax() {
      var scrollY = window.scrollY;
      var vh = window.innerHeight;

      // Hero background parallax
      if (heroBg && scrollY < vh) {
        heroBg.style.transform = 'translateY(' + (scrollY * 0.3) + 'px) scale(1.05)';
      }

      // Hero content fade out on scroll
      if (heroContent && scrollY < vh) {
        var opacity = 1 - (scrollY / (vh * 0.7));
        var translateY = scrollY * 0.15;
        heroContent.style.opacity = Math.max(0, opacity);
        heroContent.style.transform = 'translateY(' + translateY + 'px)';
      }

      // Section label numbers — subtle float
      sectionLabels.forEach(function (label) {
        var rect = label.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          var progress = (vh - rect.top) / (vh + rect.height);
          var shift = (progress - 0.5) * 12;
          label.style.transform = 'translateY(' + shift + 'px)';
        }
      });

      // Feature card numbers — parallax drift
      featureNumbers.forEach(function (num) {
        var rect = num.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          var progress = (vh - rect.top) / (vh + rect.height);
          var shift = (progress - 0.5) * -20;
          num.style.transform = 'translateY(' + shift + 'px)';
        }
      });

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  })();

  /* ═══════════════════════════════════════════════════════════
     TILT EFFECT ON CARDS
     Subtle 3D tilt on feature cards & result cards on hover
     ═══════════════════════════════════════════════════════════ */
  (function initTilt() {
    if (window.matchMedia('(hover: none)').matches) return;

    var tiltCards = document.querySelectorAll('.feature-card, .result-card, .program-card');

    tiltCards.forEach(function (card) {
      card.style.transformStyle = 'preserve-3d';
      card.style.willChange = 'transform';

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        var rotateX = ((y - centerY) / centerY) * -4;
        var rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(function () {
          card.style.transition = '';
        }, 500);
      });
    });
  })();

  /* ═══════════════════════════════════════════════════════════
     MAGNETIC BUTTON EFFECT
     CTA buttons attract cursor slightly on hover
     ═══════════════════════════════════════════════════════════ */
  (function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;

    var buttons = document.querySelectorAll('.hero__cta, .footer__cta-btn, .testimonials__naver-link');

    buttons.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = 'translate(' + (x * 0.2) + 'px, ' + (y * 0.2) + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0, 0)';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(function () {
          btn.style.transition = '';
        }, 400);
      });
    });
  })();

  /* ═══════════════════════════════════════════════════════════
     SMOOTH TEXT REVEAL
     Counter numbers, timeline items — stagger on scroll
     ═══════════════════════════════════════════════════════════ */
  (function initStaggerReveal() {
    var timelineItems = document.querySelectorAll('.results__timeline-item');
    if (timelineItems.length === 0) return;

    timelineItems.forEach(function (item) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    var timelineObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        timelineItems.forEach(function (item, index) {
          setTimeout(function () {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, index * 150);
        });
        timelineObserver.disconnect();
      }
    }, { threshold: 0.3 });

    var timeline = document.querySelector('.results__timeline-track');
    if (timeline) timelineObserver.observe(timeline);
  })();

  /* ═══════════════════════════════════════════════════════════
     TYPING EFFECT ON HERO BADGE
     Subtle typewriter on the badge text
     ═══════════════════════════════════════════════════════════ */
  (function initTypingBadge() {
    var badge = document.querySelector('.hero__badge');
    if (!badge) return;

    // Get the text node (between the two line spans)
    var textContent = '청라 김우석영어';
    var lines = badge.querySelectorAll('.hero__badge-line');
    if (lines.length < 2) return;

    // Clear original text, then type it
    var textNode = badge.childNodes[2]; // text between spans
    if (!textNode || textNode.nodeType !== 3) return;

    textNode.textContent = '';
    var charIndex = 0;

    setTimeout(function typeChar() {
      if (charIndex < textContent.length) {
        textNode.textContent += textContent[charIndex];
        charIndex++;
        setTimeout(typeChar, 80 + Math.random() * 40);
      }
    }, 800);
  })();

  /* ═══════════════════════════════════════════════════════════
     SCROLL PROGRESS BAR
     Thin crimson line at top showing scroll progress
     ═══════════════════════════════════════════════════════════ */
  (function initScrollProgress() {
    var bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#CC2C26,#E04A42);z-index:1001;transition:width 0.1s linear;width:0;pointer-events:none;';
    document.body.appendChild(bar);

    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }, { passive: true });
  })();

  /* ═══════════════════════════════════════════════════════════
     GALLERY IMAGE HOVER ZOOM CURSOR
     Custom "확대" cursor on gallery items
     ═══════════════════════════════════════════════════════════ */
  (function initGalleryCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    var galleryItems = document.querySelectorAll('.gallery__item');
    galleryItems.forEach(function (item) {
      item.style.cursor = 'zoom-in';
    });
  })();

  /* ─── SCROLL ANIMATIONS via Intersection Observer ─── */
  var animElements = document.querySelectorAll('.anim-fade, .anim-slide-up');

  var animObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
          setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, delay * 120);
          animObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  animElements.forEach(function (el) {
    animObserver.observe(el);
  });

  /* ─── COUNTER ANIMATION ─── */
  var counters = document.querySelectorAll('.about__counter-number');
  var counterAnimated = false;

  function animateCounters() {
    if (counterAnimated) return;
    counterAnimated = true;

    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-target'), 10);
      var suffix = counter.getAttribute('data-suffix') || '';
      var duration = 2000;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        counter.textContent = current + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target + suffix;
        }
      }

      requestAnimationFrame(step);
    });
  }

  var counterSection = document.querySelector('.about__counters');
  if (counterSection) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          animateCounters();
          counterObserver.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    counterObserver.observe(counterSection);
  }

  /* ─── KEYWORD BAR ANIMATION ─── */
  var keywordBars = document.querySelectorAll('.keyword-bar__fill');

  var barObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var width = entry.target.getAttribute('data-width');
          entry.target.style.width = width + '%';
          entry.target.classList.add('is-visible');
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  keywordBars.forEach(function (bar) {
    barObserver.observe(bar);
  });

  /* ─── REVIEW CAROUSEL ─── */
  var track = document.getElementById('reviewTrack');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var dotsContainer = document.getElementById('carouselDots');
  var cards = track ? track.querySelectorAll('.review-card') : [];
  var currentIndex = 0;

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCount());
  }

  function updateCarousel() {
    if (!track || cards.length === 0) return;
    var visibleCount = getVisibleCount();
    var cardWidth = cards[0].offsetWidth;
    var gap = 24;
    var offset = currentIndex * (cardWidth + gap);
    track.style.transform = 'translateX(-' + offset + 'px)';
    updateDots();
  }

  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    var maxIdx = getMaxIndex();
    for (var i = 0; i <= maxIdx; i++) {
      var dot = document.createElement('button');
      dot.className = 'testimonials__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', '리뷰 ' + (i + 1));
      dot.setAttribute('data-index', i);
      dot.addEventListener('click', function () {
        currentIndex = parseInt(this.getAttribute('data-index'), 10);
        updateCarousel();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    var dots = dotsContainer.querySelectorAll('.testimonials__dot');
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === currentIndex);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      currentIndex = Math.max(0, currentIndex - 1);
      updateCarousel();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      currentIndex = Math.min(getMaxIndex(), currentIndex + 1);
      updateCarousel();
    });
  }

  // Touch/swipe
  var touchStartX = 0;
  var touchEndX = 0;
  if (track) {
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          currentIndex = Math.min(getMaxIndex(), currentIndex + 1);
        } else {
          currentIndex = Math.max(0, currentIndex - 1);
        }
        updateCarousel();
      }
    }, { passive: true });
  }

  createDots();
  window.addEventListener('resize', function () {
    currentIndex = Math.min(currentIndex, getMaxIndex());
    createDots();
    updateCarousel();
  });

  /* ─── GALLERY LIGHTBOX ─── */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var galleryItemsAll = document.querySelectorAll('.gallery__item');

  galleryItemsAll.forEach(function (item) {
    item.addEventListener('click', function () {
      var img = this.querySelector('.gallery__img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();
