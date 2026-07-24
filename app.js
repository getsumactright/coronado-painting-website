/**
 * Coronado's Painting Landing Page - Core Interaction Script
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. Mobile Menu Drawer Toggle ─────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

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


  // ─── 2. Scroll Events (Header Blur & Back to Top) ────────
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('back-to-top-btn');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header styling shift
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Back to top appearance
    if (scrollY > 400) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });


  // ─── 3. Dynamic Phone Number Input Formatting ─────────────
  const phoneInput = document.getElementById('phone');

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


  // ─── 4. Strict Form UX & Validation ───────────────────────
  const quoteForm = document.getElementById('quote-form');
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

  // Handle Form Mutating Submissions
  quoteForm.addEventListener('submit', (e) => {
    // Prevent spam bot submissions via hidden honeypot
    const honeypot = document.getElementById('honeypot').value;
    if (honeypot) {
      e.preventDefault();
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
      e.preventDefault(); // Block submission if errors exist
      // Direct reader focus to first invalid element
      if (firstInvalidElement) {
        firstInvalidElement.focus();
      }
      return;
    }

    // Let form submit natively to send-email.php since it is 100% valid!
    const submitBtn = document.getElementById('submit-quote-btn');
    setTimeout(() => {
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Sending...';
    }, 10);
  });

  // Check URL parameters for redirection status from send-email.php
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('status') === 'success') {
    const successName = urlParams.get('name') || 'Client';
    const successContact = urlParams.get('contact') || 'your phone/email';
    
    successNameText.textContent = decodeURIComponent(successName);
    successContactText.textContent = decodeURIComponent(successContact);
    
    successOverlay.classList.add('show');
    successOverlay.setAttribute('aria-hidden', 'false');

    // Clean URL query parameters so page refresh doesn't pop up success card again
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (urlParams.get('status') === 'error') {
    alert("Oops! There was a server error sending your quote request. Please call Ramon Coronado directly at (916) 301-8533!");
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Close success state popup
  successResetBtn.addEventListener('click', () => {
    successOverlay.classList.remove('show');
    successOverlay.setAttribute('aria-hidden', 'true');
  });


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


  // ─── 5. Accessible Before/After Image Sliders (Multi-instance support) ───
  const sliders = document.querySelectorAll('.comparison-slider');

  sliders.forEach(slider => {
    const beforeImgContainer = slider.querySelector('.image-before');
    const handle = slider.querySelector('.slider-handle');

    if (beforeImgContainer && handle) {
      let isDragging = false;

      function setSliderPercentage(percent) {
        const constrainedPercent = Math.max(0, Math.min(100, percent));
        beforeImgContainer.style.clipPath = `polygon(0 0, ${constrainedPercent}% 0, ${constrainedPercent}% 100%, 0 100%)`;
        handle.style.left = `${constrainedPercent}%`;
        handle.setAttribute('aria-valuenow', Math.round(constrainedPercent));
      }

      function calculatePercent(clientX) {
        const rect = slider.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        return (relativeX / rect.width) * 100;
      }

      // Mouse Events
      slider.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
          isDragging = true;
          updateSliderPosition(e);
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (isDragging) {
          updateSliderPosition(e);
        }
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });

      // Touch Events (Mobile support)
      slider.addEventListener('touchstart', (e) => {
        isDragging = true;
        updateSliderPosition(e.touches[0]);
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (isDragging) {
          updateSliderPosition(e.touches[0]);
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        isDragging = false;
      });

      function updateSliderPosition(pointerEvent) {
        const percent = calculatePercent(pointerEvent.clientX);
        setSliderPercentage(percent);
      }

      // Keyboard Controls (Aria accessibility)
      handle.addEventListener('keydown', (e) => {
        let currentVal = parseInt(handle.getAttribute('aria-valuenow')) || 50;

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setSliderPercentage(currentVal - 5);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setSliderPercentage(currentVal + 5);
        } else if (e.key === 'Home') {
          e.preventDefault();
          setSliderPercentage(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          setSliderPercentage(100);
        }
      });
    }
  });

  // ─── Before/After Carousel Logic ───
  const carousel = document.getElementById('before-after-carousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    let currentSlide = 0;
    const totalSlides = slides.length;

    function showSlide(index) {
      // Loop bounds
      if (index >= totalSlides) {
        currentSlide = 0;
      } else if (index < 0) {
        currentSlide = totalSlides - 1;
      } else {
        currentSlide = index;
      }

      // Update active states
      slides.forEach((slide, i) => {
        if (i === currentSlide) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      dots.forEach((dot, i) => {
        if (i === currentSlide) {
          dot.classList.add('active');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('active');
          dot.removeAttribute('aria-current');
        }
      });
    }

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
      });

      nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
      });
    }

    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const slideIndex = parseInt(e.target.getAttribute('data-slide'));
        showSlide(slideIndex);
      });
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
