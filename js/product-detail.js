(() => {
  const root = document.getElementById('detail');
  if (!root) return;

  const lang = document.documentElement.lang === 'fa' ? 'fa' : 'en';

  // all interface texts in one place
  const TEXT = {
    en: {
      back: '← Back to products', size: 'Size', add: 'Add to bag', added: 'Added ✓',
      pickSize: 'Please choose a size first.', details: 'Details', set: 'In this set',
      notFound: 'Product not found', notFoundText: 'This item does not exist or the link is wrong.',
      cartError: 'The bag is not available right now. Please reload the page.',
      price: (n) => `$${n}`, listPage: './product.html',
    },
    fa: {
      back: '→ بازگشت به محصولات', size: 'سایز', add: 'افزودن به سبد', added: 'اضافه شد ✓',
      pickSize: 'لطفاً اول سایز را انتخاب کنید.', details: 'مشخصات', set: 'اجزای این ست',
      notFound: 'محصول پیدا نشد', notFoundText: 'این محصول وجود ندارد یا لینک اشتباه است.',
      cartError: 'سبد خرید در دسترس نیست. صفحه را دوباره بارگذاری کن.',
      price: (n) => `${Number(n).toLocaleString('fa-IR')} دلار`, listPage: './product-fa.html',
    },
  };
  const t = TEXT[lang];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const id = new URLSearchParams(location.search).get('id');
  const products = window.PRODUCTS || {};
  const base = id && Object.prototype.hasOwnProperty.call(products, id) ? products[id] : null;

  // language switch: build the link from the CURRENT file name, so it works
  // in any folder or server and keeps the same ?id=
  const sw = document.getElementById('lang-switch');
  if (sw) {
    const otherPath = lang === 'fa'
      ? location.pathname.replace('-fa.html', '.html')
      : location.pathname.replace('.html', '-fa.html');
    sw.href = otherPath + location.search;
  }

  // ---------- product not found ----------
  if (!base) {
    document.title = `${t.notFound} | MALECA`;
    const box = el('div', 'detail-missing');
    box.append(el('h1', null, t.notFound), el('p', null, t.notFoundText));
    const backLink = el('a', 'detail-back', t.back);
    backLink.href = t.listPage;
    box.append(backLink);
    root.replaceChildren(box);
    return;
  }

  // Persian fields override English ones; anything missing falls back to English
  const product = lang === 'fa' && base.fa ? { ...base, ...base.fa } : base;
  const images = Array.isArray(product.images) ? product.images : [];

  document.title = `${product.name} | MALECA`;

  // ---------- gallery ----------
  const gallery = el('div', 'detail-gallery');
  const mainWrap = el('div', 'detail-main-img');
  const mainImg = document.createElement('img');
  if (images.length) mainImg.src = images[0];
  mainImg.alt = product.name;
  mainWrap.append(mainImg);
  gallery.append(mainWrap);

  if (images.length > 1) {
    const thumbs = el('div', 'detail-thumbs');
    images.forEach((src, i) => {
      const b = el('button', 'detail-thumb');
      b.type = 'button';
      b.setAttribute('aria-label', `${i + 1}`);
      const ti = document.createElement('img');
      ti.src = src;
      ti.alt = '';
      b.append(ti);
      b.addEventListener('click', () => { mainImg.src = src; });
      thumbs.append(b);
    });
    gallery.append(thumbs);
  }

  // ---------- info ----------
  const info = el('div', 'detail-info');
  const backLink = el('a', 'detail-back', t.back);
  backLink.href = t.listPage;

  const title = el('h1', 'detail-title', product.name);
  const price = el('p', 'detail-price', t.price(product.price));
  const desc = el('p', 'detail-desc', product.description || '');

  const msg = el('p', 'detail-msg');
  msg.setAttribute('role', 'status');

  let selectedSize = null;
  const sizeLabel = el('p', 'detail-label', t.size);
  const sizeRow = el('div', 'detail-sizes');
  const sizeButtons = (product.sizes || []).map((size) => {
    const b = el('button', 'detail-size', size);
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      selectedSize = size;
      sizeButtons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      msg.textContent = '';
    });
    sizeRow.append(b);
    return b;
  });

  const addBtn = el('button', 'detail-add', t.add);
  addBtn.type = 'button';
  addBtn.addEventListener('click', () => {
    if (sizeButtons.length && !selectedSize) {
      msg.textContent = t.pickSize;
      return;
    }
    if (!window.Cart || typeof window.Cart.add !== 'function') {
      msg.textContent = t.cartError;
      return;
    }
    window.Cart.add({
      id,
      name: product.name,
      price: product.price,
      img: images[0] || '',
      size: selectedSize,
    });
    msg.textContent = '';
    addBtn.textContent = t.added;
    addBtn.disabled = true;
    setTimeout(() => {
      addBtn.textContent = t.add;
      addBtn.disabled = false;
    }, 1000);
  });

  info.append(backLink, title, price, desc);
  if (sizeButtons.length) info.append(sizeLabel, sizeRow);
  info.append(addBtn, msg);

  if (product.details && product.details.length) {
    info.append(el('h2', 'detail-h2', t.details));
    const dl = el('dl', 'detail-specs');
    product.details.forEach(([k, v]) => dl.append(el('dt', null, k), el('dd', null, v)));
    info.append(dl);
  }

  if (product.set && product.set.length) {
    info.append(el('h2', 'detail-h2', t.set));
    const ul = el('ul', 'detail-set');
    product.set.forEach((item) => ul.append(el('li', null, item)));
    info.append(ul);
  }

  root.replaceChildren(gallery, info);
})();