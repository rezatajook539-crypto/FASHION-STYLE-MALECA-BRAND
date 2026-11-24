// Shared cart: loaded on every page that has a bag link.
(() => {
  const STORAGE_KEY = 'maleca-cart';
  const isFa = document.documentElement.lang === 'fa';
  const bagLink = document.getElementById('bag-link');

  const keyOf = (item) => `${item.id}|${item.size || ''}`;

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function save(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // private mode or full storage
    }
    renderBadge();
  }

  // same product + same size => qty + 1, otherwise a new line
  function add(product) {
    const cart = read();
    const existing = cart.find((item) => keyOf(item) === keyOf(product));
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    save(cart);
  }

  // set an exact quantity (below 1 removes the line)
  function setQty(key, qty) {
    const cart = read();
    const item = cart.find((i) => keyOf(i) === key);
    if (!item) return;
    if (qty < 1) return remove(key);
    item.qty = Math.min(qty, 99);
    save(cart);
  }

  function remove(key) {
    save(read().filter((i) => keyOf(i) !== key));
  }

  function clear() {
    save([]);
  }

  function count() {
    return read().reduce((sum, item) => sum + item.qty, 0);
  }

  function total() {
    return read().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  // address of the cart page, from the current page's folder and language
  function cartUrl() {
    const file = isFa ? 'cart-fa.html' : 'cart.html';
    return location.pathname.includes('/html/') ? `./${file}` : `./html/${file}`;
  }

  function renderBadge() {
    if (!bagLink) return;
    const fallback = isFa ? 'سبد خرید' : 'Bag';
    bagLink.textContent = `${bagLink.dataset.label || fallback} (${count()})`;
  }

  if (bagLink) bagLink.href = cartUrl();

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) renderBadge();
  });

  window.Cart = { add, setQty, remove, clear, read, count, total, keyOf, renderBadge };
  renderBadge();
})();
