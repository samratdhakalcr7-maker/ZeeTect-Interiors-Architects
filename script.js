history.scrollRestoration = 'manual';
const resetScrollPosition = () => {
  history.scrollRestoration = 'manual';
  if (window.location.hash) return;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};
resetScrollPosition();
window.addEventListener('pageshow', (event) => {
  if (event.persisted || !window.location.hash) resetScrollPosition();
});

const initializeSite = () => {
  history.scrollRestoration = 'manual';
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const heroMedia = document.querySelector('[data-parallax]');

  document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      const item = question.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
        openItem.classList.remove('is-open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    mobileNav.classList.toggle('open', !isOpen);
  });

  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
    });
  });

  const canUsePointerParallax = window.matchMedia('(pointer: fine)').matches;
  canUsePointerParallax && heroMedia?.addEventListener('pointermove', (event) => {
    const bounds = heroMedia.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * -9;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -9;
    heroMedia.querySelector('.image-placeholder').style.setProperty('--pan-x', `${x}px`);
    heroMedia.querySelector('.image-placeholder').style.setProperty('--pan-y', `${y}px`);
  });

  canUsePointerParallax && heroMedia?.addEventListener('pointerleave', () => {
    heroMedia.querySelector('.image-placeholder').style.setProperty('--pan-x', '0px');
    heroMedia.querySelector('.image-placeholder').style.setProperty('--pan-y', '0px');
  });

  window.addEventListener('scroll', () => {
    const image = heroMedia?.querySelector('.image-placeholder');
    if (!image) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    image.style.setProperty('--scroll-pan-y', `${window.scrollY * -0.045}px`);
  }, { passive: true });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const heroImage = heroMedia?.querySelector('.image-placeholder');
    if (heroImage) {
      gsap.to(heroImage, {
        '--scroll-pan-y': '-42px',
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  } else {
    document.querySelectorAll('.reveal').forEach((element) => {
      element.style.opacity = '1';
      element.style.transform = 'none';
    });
  }

  const revealOnScroll = () => {
    const reveal = (element, delay = 0) => {
      if (element.dataset.revealed === 'true') return;
      if (element.classList.contains('hero') || element.closest('.hero')) return;
      const bounds = element.getBoundingClientRect();
      if (bounds.top > window.innerHeight * .9 || bounds.bottom < 0) return;
      element.dataset.revealed = 'true';
      element.style.animationDelay = `${delay}s`;
      element.style.visibility = 'visible';
      element.classList.add('is-visible');
      window.setTimeout(() => {
        element.classList.remove('is-visible');
        element.style.animation = 'none';
        element.style.opacity = '1';
        element.style.removeProperty('transform');
      }, 950 + (delay * 1000));
    };
    document.querySelectorAll('.reveal').forEach((element) => {
      if (!element.closest('.stagger')) reveal(element);
    });
    document.querySelectorAll('.stagger').forEach((group) => {
      const bounds = group.getBoundingClientRect();
      if (bounds.top > window.innerHeight * .9 || bounds.bottom < 0) return;
      [...group.children].forEach((element, index) => reveal(element, index * .11));
    });
  };
  window.addEventListener('scroll', revealOnScroll, { passive: true });
  revealOnScroll();

  const form = document.querySelector('#contact-form');
  const fields = [...form.querySelectorAll('input, select, textarea')];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field) => {
    const row = field.closest('.form-row');
    const error = row.querySelector('.error-message');
    let message = '';
    if (!field.value.trim()) message = 'Please add this detail.';
    else if (field.type === 'email' && !emailPattern.test(field.value.trim())) message = 'Please enter a valid email address.';
    row.classList.toggle('invalid', Boolean(message));
    error.textContent = message;
    return !message;
  };

  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.form-row').classList.contains('invalid')) validateField(field);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const valid = fields.map(validateField).every(Boolean);
    const status = form.querySelector('.form-status');
    if (!valid) {
      const firstInvalid = form.querySelector('.invalid input, .invalid select, .invalid textarea');
      firstInvalid?.focus({ preventScroll: true });
      firstInvalid?.closest('.form-row').scrollIntoView({ behavior: 'smooth', block: 'center' });
      status.textContent = '';
      return;
    }
    form.style.opacity = '1';
    form.style.visibility = 'visible';
    form.style.transform = 'none';
    form.querySelectorAll('.form-row, .button, .form-status').forEach((element) => { element.hidden = true; });
    form.querySelector('.confirmation').hidden = false;
    form.reset();
  });
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeSite, { once: true });
else initializeSite();
