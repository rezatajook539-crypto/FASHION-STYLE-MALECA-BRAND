/* ==========================================================
   MALECA — index-java.js
   مشترک بین index.html و index-fa.html
   هر بخش اول چک می‌کند المان موردنظرش در صفحه هست یا نه،
   پس اگر چیزی در یک صفحه نبود، خطا نمی‌دهد.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const $  = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  // زبان و جهت صفحه
  const isFa = document.documentElement.lang === 'fa';

  /* ---------- 1) هدر: بعد از اسکرول کلاس scrolled بگیرد ---------- */
  const header = $('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 50);
    onScroll(); // اگر صفحه وسط اسکرول رفرش شد
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- 2) منوی موبایل (فقط در نسخه‌ی انگلیسی دکمه دارد) ---------- */
  const menuToggle = $('#menu-toggle');
  const nav = $('.nav');
  if (menuToggle && nav) {
    const setMenu = (open) => {
      nav.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.innerHTML = open ? '&times;' : '&#9776;';
    };

    menuToggle.addEventListener('click', () => {
      setMenu(!nav.classList.contains('open'));
    });

    // با کلیک روی هر لینک منو بسته شود
    $$('a', nav).forEach(link => link.addEventListener('click', () => setMenu(false)));
  }

  /* ---------- 3) جستجوی محصولات ---------- */
  const searchOpen  = $('#search-open');
  const searchBar   = $('#search-bar');
  const searchInput = $('#search-input');
  const searchClose = $('#search-close');
  const noResults   = $('#no-results');
  const products    = $$('.best-grid .product');

  function filterProducts(query) {
    const q = query.trim().toLowerCase();
    let visibleCount = 0;

    products.forEach(product => {
      const title = $('h3', product)?.textContent || '';
      const alt   = $('img', product)?.alt || '';
      const match = !q || `${title} ${alt}`.toLowerCase().includes(q);

      product.classList.toggle('hidden', !match);
      if (match) visibleCount++;
    });

    if (noResults) noResults.classList.toggle('hidden', visibleCount !== 0);
  }

  if (searchOpen && searchBar && searchInput) {
    const openSearch = () => {
      searchBar.classList.add('open');
      searchInput.focus();
    };

    const closeSearch = () => {
      searchBar.classList.remove('open');
      searchInput.value = '';
      filterProducts('');
    };

    searchOpen.addEventListener('click', (e) => {
      e.preventDefault();
      searchBar.classList.contains('open') ? closeSearch() : openSearch();
    });

    if (searchClose) searchClose.addEventListener('click', closeSearch);

    searchInput.addEventListener('input', () => {
      filterProducts(searchInput.value);
      // نتیجه‌ها در سکشن پرفروش‌هاست؛ کاربر را به آنجا ببر
      if (searchInput.value.trim()) $('#best')?.scrollIntoView();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchBar.classList.contains('open')) closeSearch();
    });
  }

  /* ---------- 4) اسلایدر پرفروش‌ترین‌ها (دکمه‌های فلش) ---------- */
  const grid   = $('.best-grid');
  const arrows = $$('.arrow');

  if (grid && arrows.length === 2) {
    const [prevBtn, nextBtn] = arrows; // دکمه‌ی اول قبلی، دومی بعدی (در هر دو زبان)
    const GAP = 8; // همان gap در CSS
    // در صفحه‌ی راست‌چین اسکرول برعکس است: "بعدی" یعنی حرکت به چپ
    const direction = isFa ? -1 : 1;

    const cardWidth = () => {
      const card = $('.product:not(.hidden)', grid);
      return card ? card.getBoundingClientRect().width + GAP : grid.clientWidth;
    };

    const slide = (sign, clicked, other) => {
      grid.scrollBy({ left: sign * direction * cardWidth(), behavior: 'smooth' });
      clicked.classList.add('arrow-active');
      other.classList.remove('arrow-active');
    };

    prevBtn.addEventListener('click', () => slide(-1, prevBtn, nextBtn));
    nextBtn.addEventListener('click', () => slide(1, nextBtn, prevBtn));
  }

  /* ---------- 5) فرم خبرنامه ---------- */
  const form = $('.newsletter-form');
  if (form) {
    const emailInput = $('input[type="email"]', form);

    // پیام زیر فرم را خودمان می‌سازیم (در HTML وجود ندارد)
    let message = $('.newsletter-message');
    if (!message) {
      message = document.createElement('p');
      message.className = 'newsletter-message';
      message.setAttribute('aria-live', 'polite');
      form.after(message);
    }

    const text = isFa
      ? { empty: 'لطفاً ایمیل خود را وارد کنید.',
          invalid: 'ایمیل واردشده معتبر نیست.',
          success: 'ممنون! شما با موفقیت عضو شدید.' }
      : { empty: 'Please enter your email address.',
          invalid: 'This email address is not valid.',
          success: 'Thank you! You are now subscribed.' };

    const show = (msg, type) => {
      message.textContent = msg;
      message.classList.remove('success', 'error');
      message.classList.add(type);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault(); // جلوگیری از رفرش صفحه
      const value = emailInput.value.trim();

      if (!value) return show(text.empty, 'error');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return show(text.invalid, 'error');

      show(text.success, 'success');
      form.reset();
    });
  }

  /* ---------- 6) انیمیشن ظاهر شدن سکشن‌ها هنگام اسکرول ---------- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // فقط یک‌بار
        }
      });
    }, { threshold: 0.12 });

    // هیرو عمداً در لیست نیست تا از اول دیده شود
    $$('.edit, .best, .philosophy, .campaign, .newsletter, .footer').forEach(section => {
      section.classList.add('reveal');
      observer.observe(section);
    });
  }

});