/**
 * Coronado's Painting Landing Page - Core Interaction Script
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. Mobile Menu Drawer Toggle ─────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (hamburger && mobileMenu) {
    function toggleMobileMenu() {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('open');
      mobileMenu.setAttribute('aria-hidden', isExpanded);
      document.body.style.overflow = isExpanded ? '' : 'hidden'; // Lock background scroll when open
    }

    hamburger.addEventListener('click', toggleMobileMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Close drawer upon clicking any navigation target
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }


  // ─── 2. Scroll Events (Header Blur & Back to Top) ────────
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('back-to-top-btn');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header styling shift
    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Back to top appearance
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


  // ─── 3. Dynamic Phone Number Input Formatting ─────────────
  const phoneInput = document.getElementById('phone');

  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let input = e.target.value.replace(/\D/g, ''); // Extract numbers only
      const length = input.length;

      // Auto-formatting (123) 456-7890
      if (length === 0) {
        e.target.value = '';
      } else if (length <= 3) {
        e.target.value = `(${input}`;
      } else if (length <= 6) {
        e.target.value = `(${input.slice(0, 3)}) ${input.slice(3)}`;
      } else {
        e.target.value = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`;
      }
    });
  }


  // ─── 4. Strict Form UX & Validation ───────────────────────
  const quoteForm = document.getElementById('quote-form');

  if (quoteForm) {
  const successOverlay = document.getElementById('form-success-container');
  const successNameText = document.getElementById('success-user-name');
  const successContactText = document.getElementById('success-user-contact');
  const successResetBtn = document.getElementById('success-reset-btn');

  // Input elements
  const inputs = {
    firstName: {
      el: document.getElementById('first-name'),
      err: document.getElementById('first-name-error'),
      validate: (val) => val.trim().length >= 2 ? '' : 'First name must be at least 2 characters.'
    },
    lastName: {
      el: document.getElementById('last-name'),
      err: document.getElementById('last-name-error'),
      validate: (val) => val.trim().length >= 2 ? '' : 'Last name must be at least 2 characters.'
    },
    address: {
      el: document.getElementById('address'),
      err: document.getElementById('address-error'),
      validate: (val) => val.trim().length >= 8 ? '' : 'Please provide a valid street address.'
    },
    email: {
      el: document.getElementById('email'),
      err: document.getElementById('email-error'),
      validate: (val) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(val) ? '' : 'Please enter a valid email address.';
      }
    },
    phone: {
      el: phoneInput,
      err: document.getElementById('phone-error'),
      validate: (val) => {
        const numbers = val.replace(/\D/g, '');
        return numbers.length === 10 ? '' : 'Please enter a complete 10-digit phone number.';
      }
    },
    serviceType: {
      el: document.getElementById('service-type'),
      err: document.getElementById('service-error'),
      validate: (val) => val !== '' ? '' : 'Please select a service type.'
    },
    details: {
      el: document.getElementById('details'),
      err: document.getElementById('details-error'),
      validate: (val) => val.trim().length >= 10 ? '' : 'Please describe your request (min 10 characters).'
    }
  };

  // Perform validation on specific input element
  function checkField(fieldObj) {
    const errorMsg = fieldObj.validate(fieldObj.el.value);
    fieldObj.err.textContent = errorMsg;
    if (errorMsg) {
      fieldObj.el.classList.add('invalid');
      fieldObj.el.setAttribute('aria-invalid', 'true');
      return false;
    } else {
      fieldObj.el.classList.remove('invalid');
      fieldObj.el.removeAttribute('aria-invalid');
      return true;
    }
  }

  // Bind Listeners: Validate on BLUR (when exiting field)
  Object.keys(inputs).forEach(key => {
    const field = inputs[key];
    
    field.el.addEventListener('blur', () => {
      // Validate on blur
      checkField(field);
    });

    field.el.addEventListener('input', () => {
      // Clear errors dynamically on input typing (non-intrusive)
      field.err.textContent = '';
      field.el.classList.remove('invalid');
    });
  });

  // Handle Form Mutating Submissions — delivered via Web3Forms (no server/PHP required)
  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Always intercept; we submit via fetch() below

    // Prevent spam bot submissions via hidden honeypot
    const honeypot = document.getElementById('honeypot').value;
    if (honeypot) {
      console.warn('Spam submission detected.');
      return;
    }

    let formIsValid = true;
    let firstInvalidElement = null;

    // Validate all inputs
    Object.keys(inputs).forEach(key => {
      const field = inputs[key];
      const isValid = checkField(field);
      if (!isValid) {
        formIsValid = false;
        if (!firstInvalidElement) {
          firstInvalidElement = field.el;
        }
      }
    });

    if (!formIsValid) {
      // Direct reader focus to first invalid element
      if (firstInvalidElement) {
        firstInvalidElement.focus();
      }
      return;
    }

    // Build a friendlier, more identifiable email subject now that we know who's submitting
    const firstNameVal = inputs.firstName.el.value.trim();
    const lastNameVal = inputs.lastName.el.value.trim();
    const serviceLabel = inputs.serviceType.el.selectedOptions[0]
      ? inputs.serviceType.el.selectedOptions[0].text
      : inputs.serviceType.el.value;
    const subjectInput = quoteForm.querySelector('input[name="subject"]');
    if (subjectInput) {
      subjectInput.value = `New Quote Request: ${firstNameVal} ${lastNameVal} — ${serviceLabel}`;
    }

    const submitBtn = document.getElementById('submit-quote-btn');
    const btnTextEl = submitBtn.querySelector('.btn-text');
    submitBtn.disabled = true;
    btnTextEl.textContent = 'Sending...';

    const formData = new FormData(quoteForm);
    const payload = Object.fromEntries(formData);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));

        if (response.ok && result.success) {
          // Populate and reveal the success overlay — no page reload needed
          successNameText.textContent = firstNameVal || 'Client';
          successContactText.textContent = inputs.phone.el.value || inputs.email.el.value || 'your phone/email';
          successOverlay.classList.add('show');
          successOverlay.setAttribute('aria-hidden', 'false');
          quoteForm.reset();
        } else {
          console.error('Web3Forms submission error:', result);
          alert("Oops! There was a problem sending your quote request. Please call Ramon Coronado directly at (916) 301-8533!");
        }
      })
      .catch((error) => {
        console.error('Network error submitting form:', error);
        alert("Oops! There was a problem sending your quote request. Please call Ramon Coronado directly at (916) 301-8533!");
      })
      .finally(() => {
        submitBtn.disabled = false;
        btnTextEl.textContent = 'Submit Request';
      });
  });

  // Fallback: if a visitor's browser has JavaScript disabled, the form still posts
  // natively to Web3Forms and redirects back here with ?status=success — show a
  // generic (non-personalized) success overlay in that case.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('status') === 'success') {
    successNameText.textContent = 'Client';
    successContactText.textContent = 'your phone/email';

    successOverlay.classList.add('show');
    successOverlay.setAttribute('aria-hidden', 'false');

    // Clean URL query parameters so page refresh doesn't pop up success card again
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Close success state popup
  successResetBtn.addEventListener('click', () => {
    successOverlay.classList.remove('show');
    successOverlay.setAttribute('aria-hidden', 'true');
  });
  } // end if (quoteForm)


  // ─── 4b. Sync aria-invalid with CSS :user-invalid state ───
  // Keeps screen readers in sync with the native :user-invalid visual state
  // so users relying on assistive technology get the same feedback timing.
  // Recommended by modern-web-guidance: validate-input-after-interaction
  const syncAriaInvalid = (el) => {
    if (!el || typeof el.matches !== 'function') return;
    el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
  };

  document.addEventListener('blur', (e) => syncAriaInvalid(e.target), true);
  document.addEventListener('input', (e) => {
    if (e.target.hasAttribute('aria-invalid')) syncAriaInvalid(e.target);
  });


  // ─── 5. Project Gallery Carousel & Lightbox ────────────────
  const galleryTrack = document.getElementById('galleryTrack');

  if (galleryTrack) {
    const galleryItems = Array.from(galleryTrack.querySelectorAll('.gallery-item'));
    const dotsContainer = document.getElementById('galleryDots');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    // Build one slide-indicator dot per photo
    galleryItems.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to photo ${i + 1} of ${galleryItems.length}`);
      dot.addEventListener('click', () => {
        galleryItems[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
      dotsContainer.appendChild(dot);
    });
    const dots = Array.from(dotsContainer.children);

    function setActiveDot(index) {
      dots.forEach((dot, i) => {
        const isActive = i === index;
        dot.classList.toggle('active', isActive);
        if (isActive) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }
    setActiveDot(0);

    // Track whichever slide is most visible in the track to keep dots in sync,
    // whether the user swipes, drags the scrollbar, or clicks the arrows/dots.
    const visibleRatios = new Map();
    const dotObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibleRatios.set(entry.target, entry.intersectionRatio));
      let bestIndex = 0;
      let bestRatio = 0;
      galleryItems.forEach((item, i) => {
        const ratio = visibleRatios.get(item) || 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestIndex = i;
        }
      });
      setActiveDot(bestIndex);
    }, { root: galleryTrack, threshold: [0, 0.25, 0.5, 0.75, 1] });

    galleryItems.forEach((item) => dotObserver.observe(item));

    function scrollByCards(direction) {
      const cardWidth = galleryItems[0].getBoundingClientRect().width;
      const trackGap = parseFloat(getComputedStyle(galleryTrack).gap) || 24;
      galleryTrack.scrollBy({ left: direction * (cardWidth + trackGap), behavior: 'smooth' });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollByCards(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollByCards(1));

    // ─── Lightbox (click or Enter/Space on a photo to open) ───
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxVideo = document.getElementById('lightboxVideo');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    let lightboxIndex = 0;
    let lastFocusedEl = null;

    function updateLightboxMedia() {
      const item = galleryItems[lightboxIndex];
      const img = item.querySelector('img');
      const caption = item.querySelector('figcaption');
      const videoSrc = img.dataset.video;

      lightboxVideo.pause();

      if (videoSrc) {
        lightboxImg.style.display = 'none';
        lightboxVideo.style.display = 'block';
        lightboxVideo.poster = img.src;
        if (lightboxVideo.getAttribute('src') !== videoSrc) {
          lightboxVideo.src = videoSrc;
        }
        lightboxVideo.play().catch(() => {});
      } else {
        lightboxVideo.style.display = 'none';
        lightboxVideo.removeAttribute('src');
        lightboxVideo.load();
        lightboxImg.style.display = 'block';
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
      }
      lightboxCaption.textContent = caption ? caption.textContent : '';
    }

    function openLightbox(index) {
      lightboxIndex = index;
      lastFocusedEl = document.activeElement;
      updateLightboxMedia();
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      lightboxVideo.pause();
      if (lastFocusedEl) lastFocusedEl.focus();
    }

    function showNextPhoto() {
      lightboxIndex = (lightboxIndex + 1) % galleryItems.length;
      updateLightboxMedia();
    }

    function showPrevPhoto() {
      lightboxIndex = (lightboxIndex - 1 + galleryItems.length) % galleryItems.length;
      updateLightboxMedia();
    }

    galleryItems.forEach((item, i) => {
      const img = item.querySelector('img');
      img.addEventListener('click', () => openLightbox(i));
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(i);
        }
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', showNextPhoto);
    lightboxPrev.addEventListener('click', showPrevPhoto);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') showNextPhoto();
      else if (e.key === 'ArrowLeft') showPrevPhoto();
    });
  }


  // ─── 6b. Live Yelp Rating (via yelp-rating.php server-side proxy) ──────
  // Browser JS can't call Yelp's API directly (CORS-blocked), so this fetches
  // our own same-origin PHP proxy instead. If the proxy isn't configured yet
  // (no API key) or the request fails for any reason, this fails silently and
  // the static "5.0 Rating" fallback already in the HTML stays on screen.
  const yelpRatingDisplay = document.getElementById('yelp-rating-display');

  if (yelpRatingDisplay) {
    fetch('yelp-rating.php')
      .then((response) => {
        if (!response.ok) throw new Error('Yelp proxy not ready');
        return response.json();
      })
      .then((data) => {
        if (data && typeof data.rating === 'number') {
          const count = data.review_count;
          const reviewText = count ? ` (${count} review${count === 1 ? '' : 's'})` : '';
          yelpRatingDisplay.textContent = `${data.rating.toFixed(1)} Rating${reviewText}`;
        }
      })
      .catch(() => {
        // Proxy not configured yet or Yelp unreachable — keep static fallback text.
      });
  }


  // ─── 6. Scroll Reveal — IntersectionObserver (JS Fallback) ──
  // NOTE: Modern browsers (Chrome 115+, Edge 115+, Firefox 129+, Safari 18+)
  // use CSS scroll-driven animations (animation-timeline: view()) instead.
  // This IntersectionObserver remains as a reliable fallback for older browsers
  // that don't yet support the CSS approach.
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Trigger only once
        }
      });
    }, {
      root: null,
      threshold: 0.15, // Trigger when 15% is visible
      rootMargin: '0px 0px -50px 0px' // Offset triggers slightly
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: make all elements immediately visible if observer not baseline supported
    revealElements.forEach(el => el.classList.add('visible'));
  }
});
