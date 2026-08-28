/* ==========================================================================
   KEVDEV - INTERACTIVE FAQ ACCORDION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-accordion-item');

  faqItems.forEach((item) => {
    const header = item.querySelector('.faq-accordion-header');
    const content = item.querySelector('.faq-accordion-content');

    if (!header || !content) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other items for a clean single-open accordion experience
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          const otherContent = otherItem.querySelector('.faq-accordion-content');
          const otherHeader = otherItem.querySelector('.faq-accordion-header');
          if (otherContent) otherContent.style.maxHeight = '0px';
          if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle target item
      if (isOpen) {
        item.classList.remove('active');
        content.style.maxHeight = '0px';
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
});
