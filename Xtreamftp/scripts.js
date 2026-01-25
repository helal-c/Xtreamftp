// Modal logic with accessibility (Esc, click-outside, focus return)
// + Auto-open on first page load (configurable via data-* on #noticeModal)
(function () {
  const modal    = document.getElementById('noticeModal');
  const titleEl  = document.getElementById('modalTitle');
  const bodyEl   = document.getElementById('modalBody');
  const panel    = modal.querySelector('.modal-panel');
  const backdrop = modal.querySelector('.modal-backdrop');

  // Close buttons are static in DOM
  const closeEls = modal.querySelectorAll('[data-modal-close]');

  let lastFocused = null;
  let isOpen = false;

  function openModal(title, body) {
    if (isOpen) return; // avoid duplicate opens
    lastFocused = document.activeElement;

    if (title) titleEl.textContent = title;
    if (body)  bodyEl.textContent  = body;

    modal.classList.remove('hidden');
    requestAnimationFrame(() => { // ensure style is applied before ARIA change
      modal.setAttribute('aria-hidden', 'false');
      isOpen = true;

      // Focus handling
      const primaryClose = panel.querySelector('[data-modal-close]');
      (primaryClose || panel).focus();

      // Listeners
      document.addEventListener('keydown', onEsc);
      backdrop.addEventListener('click', closeModal, { once: true });
    });
  }

  function closeModal() {
    if (!isOpen) return;
    modal.setAttribute('aria-hidden', 'true');
    isOpen = false;

    // Allow transition to complete before fully hiding
    setTimeout(() => {
      modal.classList.add('hidden');
      document.removeEventListener('keydown', onEsc);

      // Return focus to trigger
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
      lastFocused = null;
    }, 220);
  }

  function onEsc(e) {
    if (e.key === 'Escape') closeModal();
  }

  // Delegate: open modal from any element with [data-modal-open]
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-open]');
    if (!trigger) return;

    const title = trigger.getAttribute('data-title') || 'Notice';
    const body  = trigger.getAttribute('data-body')  || '';
    openModal(title, body);
  });

  // Close buttons
  closeEls.forEach(btn => btn.addEventListener('click', closeModal));

  // Auto-open on first page load (reads data-* from #noticeModal)
  window.addEventListener('DOMContentLoaded', () => {
    const shouldOpen = modal.getAttribute('data-open-on-load') === 'true';
    if (!shouldOpen) return;

    const defaultTitle = modal.getAttribute('data-default-title') || 'Notice';
    const defaultBody  = modal.getAttribute('data-default-body')  || '';
    // slight delay to avoid layout jank
    setTimeout(() => openModal(defaultTitle, defaultBody), 150);
  });
})();
