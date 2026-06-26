/* ============================================================
   Keel Documentation — main.js
   Hash-based navigation, mobile sidebar, copy code buttons
   ============================================================ */

(function () {
  'use strict';

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     Section registry — maps hash → section element id
  ---------------------------------------------------------- */
  const SECTION_MAP = {
    '#introduction':        'section-introduction',
    '#what-is-keel':        'section-what-is-keel',
    '#why-keel':            'section-why-keel',
    '#quick-start':         'section-quick-start',
    '#getting-started':     'section-getting-started',
    '#prerequisites':       'section-prerequisites',
    '#plugin-install':      'section-plugin-install',
    '#personal-skill':      'section-personal-skill',
    '#verify-first-run':    'section-verify-first-run',
    '#how-it-works':        'section-how-it-works',
    '#the-interview':       'section-the-interview',
    '#document-tailoring':  'section-document-tailoring',
    '#threat-modeling':     'section-threat-modeling',
    '#handoff':             'section-handoff',
    '#document-reference':  'section-document-reference',
    '#full-catalog':        'section-full-catalog',
    '#contributing':        'section-contributing',
  };

  const DEFAULT_HASH = '#what-is-keel';

  /* ----------------------------------------------------------
     Core navigation
  ---------------------------------------------------------- */
  function getActiveHash() {
    const hash = window.location.hash;
    if (hash && SECTION_MAP[hash]) return hash;
    return DEFAULT_HASH;
  }

  function showSection(hash) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(function (el) {
      el.classList.remove('active');
      el.setAttribute('aria-hidden', 'true');
    });

    // Show target section
    const sectionId = SECTION_MAP[hash];
    if (sectionId) {
      const target = document.getElementById(sectionId);
      if (target) {
        target.classList.add('active');
        target.removeAttribute('aria-hidden');
        // Scroll content area to top
        const main = document.getElementById('main-content');
        if (main) main.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        // Set focus to h1 within section for accessibility
        const heading = target.querySelector('h1');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        }
      }
    }

    // Update active nav link
    updateActiveNav(hash);
  }

  function updateActiveNav(activeHash) {
    document.querySelectorAll('.nav-link').forEach(function (link) {
      const linkHash = link.getAttribute('href');
      if (linkHash === activeHash) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ----------------------------------------------------------
     Nav click handler
  ---------------------------------------------------------- */
  function handleNavClick(e) {
    const link = e.currentTarget;
    const hash = link.getAttribute('href');

    if (!SECTION_MAP[hash]) return; // not a section link

    e.preventDefault();

    // Update URL without triggering hashchange
    history.pushState(null, '', hash);

    showSection(hash);
    closeMobileSidebar();
  }

  /* ----------------------------------------------------------
     Mobile sidebar
  ---------------------------------------------------------- */
  function openMobileSidebar() {
    document.body.classList.add('sidebar-open');
    const btn = document.getElementById('hamburger-btn');
    if (btn) {
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close navigation menu');
    }
  }

  function closeMobileSidebar() {
    document.body.classList.remove('sidebar-open');
    const btn = document.getElementById('hamburger-btn');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open navigation menu');
    }
  }

  function toggleMobileSidebar() {
    if (document.body.classList.contains('sidebar-open')) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  }

  /* ----------------------------------------------------------
     Copy code buttons
  ---------------------------------------------------------- */
  function addCopyButtons() {
    document.querySelectorAll('pre > code').forEach(function (codeEl) {
      const pre = codeEl.parentElement;
      if (!pre) return;

      // Wrap in a relative container
      const wrapper = document.createElement('div');
      wrapper.className = 'code-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // Create copy button
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      wrapper.appendChild(btn);

      btn.addEventListener('click', function () {
        const text = codeEl.textContent || '';
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          btn.setAttribute('aria-label', 'Code copied to clipboard');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
            btn.setAttribute('aria-label', 'Copy code to clipboard');
          }, 2000);
        }).catch(function () {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(function () {
              btn.textContent = 'Copy';
              btn.classList.remove('copied');
            }, 2000);
          } catch (_) {
            btn.textContent = 'Failed';
          }
          document.body.removeChild(textarea);
        });
      });
    });
  }

  /* ----------------------------------------------------------
     Handle back/forward browser navigation
  ---------------------------------------------------------- */
  window.addEventListener('popstate', function () {
    showSection(getActiveHash());
  });

  /* ----------------------------------------------------------
     Handle hashchange (for direct links, external links)
  ---------------------------------------------------------- */
  window.addEventListener('hashchange', function () {
    showSection(getActiveHash());
  });

  /* ----------------------------------------------------------
     Sidebar overlay click → close sidebar
  ---------------------------------------------------------- */
  function initOverlay() {
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeMobileSidebar);
    }
  }

  /* ----------------------------------------------------------
     Keyboard trap for mobile sidebar (ESC to close)
  ---------------------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
      closeMobileSidebar();
      const btn = document.getElementById('hamburger-btn');
      if (btn) btn.focus();
    }
  });

  /* ----------------------------------------------------------
     DOMContentLoaded — wire everything up
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    // Wire nav links
    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', handleNavClick);
    });

    // Wire hamburger
    const hamburger = document.getElementById('hamburger-btn');
    if (hamburger) {
      hamburger.addEventListener('click', toggleMobileSidebar);
    }

    // Wire overlay
    initOverlay();

    // Add copy buttons to all code blocks
    addCopyButtons();

    // Show initial section
    showSection(getActiveHash());

    // Mark all sections aria-hidden initially (showSection will fix the active one)
    document.querySelectorAll('.content-section').forEach(function (el) {
      if (!el.classList.contains('active')) {
        el.setAttribute('aria-hidden', 'true');
      }
    });
  });

})();
