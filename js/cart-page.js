(() => {
  const root = document.getElementById('cart');
  if (!root || !window.Cart) return;

  const lang = document.documentElement.lang === 'fa' ? 'fa' : 'en';
  const suffix = lang === 'fa' ? '-fa' : '';

  const TEXT = {
    en: {
      empty: 'Your bag is empty.', shop: 'Continue shopping', size: 'Size',
      qty: 'Quantity', minus: 'Decrease quantity', plus: 'Increase quantity', remove: 'Remove',
      summary: 'Summary', items: 'Items', subtotal: 'Subtotal', shipping: 'Shipping is calculated at checkout.',
      checkout: 'Checkout', checkoutMsg: 'Online payment is not connected yet.', clear: 'Clear bag',
      confirmClear: 'Remove everything from your bag?',
      money: (n) => `$${n}`, num: (n) => String(n),
    },
    fa: {
      empty: 'سبد خرید شما خالی است.', shop: 'ادامه‌ی خرید', size: 'سایز',
      qty: 'تعداد', minus: 'کم کردن تعداد', plus: 'زیاد کردن تعداد', remove: 'حذف',
      summary: 'خلاصه‌ی سفارش', items: 'تعداد کالا', subtotal: 'جمع کل', shipping: 'هزینه‌ی ارسال هنگام پرداخت محاسبه می‌شود.',
      checkout: 'ادامه و پرداخت', checkoutMsg: 'پرداخت آنلاین هنوز وصل نشده است.', clear: 'خالی کردن سبد',
      confirmClear: 'همه‌ی کالاها از سبد حذف شوند؟',
      money: (n) => `${n.toLocaleString('fa-IR')} دلار`, num: (n) => n.toLocaleString('fa-IR'),
    },
  };
  const t = TEXT[lang];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // name in the current language, from products.js when possible
  function displayName(item) {
    const p = window.PRODUCTS && window.PRODUCTS[item.id];
    if (!p) return item.name;
    return (lang === 'fa' && p.fa && p.fa.name) || p.name;
  }

  // language switch keeps you on the cart page
  const sw = document.getElementById('lang-switch');
  if (sw) sw.href = lang === 'fa' ? './cart.html' : './cart-fa.html';

  function render() {
    const cart = window.Cart.read();

    if (!cart.length) {
      const box = el('div', 'cart-empty');
      const link = el('a', 'cart-btn', t.shop);
      link.href = `./product${suffix}.html`;
      box.append(el('p', null, t.empty), link);
      root.replaceChildren(box);
      return;
    }

    // ---------- lines ----------
    const list = el('ul', 'cart-list');
    cart.forEach((item) => {
      const key = window.Cart.keyOf(item);
      const name = displayName(item);
      const href = `./product-detail${suffix}.html?id=${encodeURIComponent(item.id)}`;

      const li = el('li', 'cart-line');
      li.dataset.key = key;

      const imgLink = el('a', 'cart-img');
      imgLink.href = href;
      const img = document.createElement('img');
      img.src = item.img;
      img.alt = name;
      img.loading = 'lazy';
      imgLink.append(img);

      const info = el('div', 'cart-info');
      const title = el('a', 'cart-name', name);
      title.href = href;
      info.append(title);
      if (item.size) info.append(el('p', 'cart-meta', `${t.size}: ${item.size}`));
      info.append(el('p', 'cart-meta', t.money(item.price)));

      const qty = el('div', 'cart-qty');
      qty.setAttribute('role', 'group');
      qty.setAttribute('aria-label', t.qty);
      const minus = el('button', 'cart-qty-btn', '−');
      minus.type = 'button';
      minus.dataset.action = 'dec';
      minus.setAttribute('aria-label', t.minus);
      const num = el('span', 'cart-qty-num', t.num(item.qty));
      const plus = el('button', 'cart-qty-btn', '+');
      plus.type = 'button';
      plus.dataset.action = 'inc';
      plus.setAttribute('aria-label', t.plus);
      qty.append(minus, num, plus);

      const lineTotal = el('p', 'cart-line-total', t.money(item.price * item.qty));

      const rm = el('button', 'cart-remove', t.remove);
      rm.type = 'button';
      rm.dataset.action = 'remove';

      li.append(imgLink, info, qty, lineTotal, rm);
      list.append(li);
    });

    // ---------- summary ----------
    const summary = el('aside', 'cart-summary');
    const row = (label, value, cls) => {
      const r = el('div', `cart-row${cls ? ' ' + cls : ''}`);
      r.append(el('span', null, label), el('span', null, value));
      return r;
    };
    const checkout = el('button', 'cart-btn cart-checkout', t.checkout);
    checkout.type = 'button';
    checkout.dataset.action = 'checkout';
    const msg = el('p', 'cart-msg');
    msg.setAttribute('role', 'status');
    const clearBtn = el('button', 'cart-clear', t.clear);
    clearBtn.type = 'button';
    clearBtn.dataset.action = 'clear';

    summary.append(
      el('h2', 'cart-h2', t.summary),
      row(t.items, t.num(window.Cart.count())),
      row(t.subtotal, t.money(window.Cart.total()), 'cart-row-total'),
      el('p', 'cart-note', t.shipping),
      checkout, msg, clearBtn
    );

    root.replaceChildren(list, summary);
  }

  // one listener for every button on the page
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const line = btn.closest('.cart-line');
    const key = line && line.dataset.key;
    const item = key && window.Cart.read().find((i) => window.Cart.keyOf(i) === key);

    if (action === 'inc' && item) window.Cart.setQty(key, item.qty + 1);
    else if (action === 'dec' && item) window.Cart.setQty(key, item.qty - 1);
    else if (action === 'remove' && key) window.Cart.remove(key);
    else if (action === 'clear') {
      if (confirm(t.confirmClear)) window.Cart.clear();
    } else if (action === 'checkout') {
      root.querySelector('.cart-msg').textContent = t.checkoutMsg;
      return;
    }
    render();
  });

  // cart changed in another tab
  window.addEventListener('storage', (e) => {
    if (e.key === 'maleca-cart') render();
  });

  render();
})();
