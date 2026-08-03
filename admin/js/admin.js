/**
 * Jaidi Pan Shop – Admin Panel
 * Supports real Firebase Auth + Firestore, with DEMO (localStorage) fallback.
 */

const DEFAULT_MENU = [
  { id: '1', name: 'Meetha Pan', desc: 'Sweet classic with gulkand & coconut', price: 80, cat: 'pan', available: true, order: 1 },
  { id: '2', name: 'Saada Pan', desc: 'Simple betel leaf with catechu & lime', price: 50, cat: 'pan', available: true, order: 2 },
  { id: '3', name: 'Special Jaidi Pan', desc: 'House special with dry fruits & silver foil', price: 150, cat: 'pan', available: true, order: 3 },
  { id: '4', name: 'Zafrani Pan', desc: 'Saffron infused sweet pan', price: 120, cat: 'pan', available: true, order: 4 },
  { id: '5', name: 'Chocolate Pan', desc: 'Sweet pan with chocolate filling', price: 100, cat: 'pan', available: true, order: 5 },
  { id: '6', name: 'Fire Pan', desc: 'Spicy pan for the brave', price: 90, cat: 'pan', available: true, order: 6 },
  { id: '7', name: 'Fresh Orange Juice', desc: 'Freshly squeezed, no sugar', price: 200, cat: 'juices', available: true, order: 7 },
  { id: '8', name: 'Mango Juice', desc: 'Seasonal Alphonso or local mango', price: 250, cat: 'juices', available: true, order: 8 },
  { id: '9', name: 'Sugarcane Juice', desc: 'Freshly pressed with ginger & lemon', price: 150, cat: 'juices', available: true, order: 9 },
  { id: '10', name: 'Carrot Juice', desc: 'Healthy & refreshing', price: 180, cat: 'juices', available: true, order: 10 },
  { id: '11', name: 'Pomegranate Juice', desc: 'Pure anar juice', price: 280, cat: 'juices', available: true, order: 11 },
  { id: '12', name: 'Mixed Fruit Juice', desc: 'Seasonal mix of fruits', price: 220, cat: 'juices', available: true, order: 12 },
  { id: '13', name: 'Mango Shake', desc: 'Thick & creamy with ice cream', price: 250, cat: 'shakes', available: true, order: 13 },
  { id: '14', name: 'Banana Shake', desc: 'Classic banana milkshake', price: 200, cat: 'shakes', available: true, order: 14 },
  { id: '15', name: 'Chocolate Shake', desc: 'Rich chocolate delight', price: 230, cat: 'shakes', available: true, order: 15 },
  { id: '16', name: 'Strawberry Shake', desc: 'Fresh strawberry blended', price: 240, cat: 'shakes', available: true, order: 16 },
  { id: '17', name: 'Jaidi Special Shake', desc: 'House special with dry fruits', price: 300, cat: 'shakes', available: true, order: 17 },
  { id: '18', name: 'Fruit Chaat', desc: 'Fresh mixed fruit with spices', price: 200, cat: 'snacks', available: true, order: 18 },
  { id: '19', name: 'Chana Chaat', desc: 'Spicy chickpea chaat', price: 180, cat: 'snacks', available: true, order: 19 },
  { id: '20', name: 'Gol Gappay', desc: 'Crispy puris with tangy water', price: 150, cat: 'snacks', available: true, order: 20 },
  { id: '21', name: 'Papri Chaat', desc: 'Crispy papri with yogurt & chutney', price: 180, cat: 'snacks', available: true, order: 21 },
];

const DEFAULT_SETTINGS = {
  isOpen: true,
  waitMinutes: 7,
  todaySpecial: { name: 'Mango Shake', price: 250 },
  whatsapp: '923220971060',
  address: 'Near Maroof Hospital, F-10 Markaz, F 10/3, Islamabad',
  phone: '03220971060',
  tagline: 'F-10 Markaz • Islamabad',
  facebook: 'https://www.facebook.com/Jaidi.islamabad',
  mapsUrl: 'https://maps.google.com/?q=Jaidi+Pan+Shop+F-10+Markaz+Islamabad',
};

const CAT_LABELS = { pan: 'Pan', juices: 'Juices', shakes: 'Shakes', snacks: 'Chaats' };

let auth = null;
let db = null;
const isLive = window.FIREBASE_CONFIGURED === true;

if (isLive && typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(window.firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log('[Jaidi Admin] Firebase connected');
  } catch (e) {
    console.error('[Jaidi Admin] Firebase init failed', e);
  }
} else {
  console.log('[Jaidi Admin] Running in DEMO mode (localStorage)');
}

let menu = [];
let settings = { ...DEFAULT_SETTINGS };
let promos = [];

function toast(msg, isError) {
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' error' : '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(function () { el.remove(); }, 2500);
}

function setLoading(on) {
  document.getElementById('global-loading').classList.toggle('hidden', !on);
}

function showLoginError(msg) {
  var el = document.getElementById('login-error');
  if (!msg) { el.classList.add('hidden'); el.textContent = ''; return; }
  el.textContent = msg;
  el.classList.remove('hidden');
}

function setLoginLoading(on) {
  document.getElementById('login-btn').disabled = on;
  document.getElementById('login-btn-text').classList.toggle('hidden', on);
  document.getElementById('login-spinner').classList.toggle('hidden', !on);
}

async function loadAllData() {
  setLoading(true);
  try {
    if (isLive && db) {
      var menuSnap = await db.collection('menu').orderBy('order', 'asc').get();
      if (menuSnap.empty) {
        var batch = db.batch();
        DEFAULT_MENU.forEach(function (item) {
          batch.set(db.collection('menu').doc(item.id), item);
        });
        await batch.commit();
        menu = DEFAULT_MENU.slice();
      } else {
        menu = menuSnap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      }

      var settingsSnap = await db.collection('settings').doc('shop').get();
      if (!settingsSnap.exists) {
        await db.collection('settings').doc('shop').set(DEFAULT_SETTINGS);
        settings = Object.assign({}, DEFAULT_SETTINGS);
      } else {
        settings = Object.assign({}, DEFAULT_SETTINGS, settingsSnap.data());
      }

      var promoSnap = await db.collection('promotions').get();
      promos = promoSnap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    } else {
      var rawMenu = localStorage.getItem('jaidi-admin-menu');
      menu = rawMenu ? JSON.parse(rawMenu) : DEFAULT_MENU.slice();
      if (!rawMenu) localStorage.setItem('jaidi-admin-menu', JSON.stringify(menu));

      var rawSettings = localStorage.getItem('jaidi-admin-settings');
      settings = rawSettings ? JSON.parse(rawSettings) : Object.assign({}, DEFAULT_SETTINGS);
      if (!rawSettings) localStorage.setItem('jaidi-admin-settings', JSON.stringify(settings));

      var rawPromos = localStorage.getItem('jaidi-admin-promos');
      promos = rawPromos ? JSON.parse(rawPromos) : [];
    }
  } catch (err) {
    console.error(err);
    toast('Failed to load data: ' + err.message, true);
    menu = DEFAULT_MENU.slice();
    settings = Object.assign({}, DEFAULT_SETTINGS);
    promos = [];
  } finally {
    setLoading(false);
  }
}

async function saveMenuItem(item) {
  if (isLive && db) {
    var data = Object.assign({}, item);
    delete data.id;
    await db.collection('menu').doc(item.id).set(data, { merge: true });
  } else {
    var idx = menu.findIndex(function (m) { return m.id === item.id; });
    if (idx >= 0) menu[idx] = item; else menu.push(item);
    localStorage.setItem('jaidi-admin-menu', JSON.stringify(menu));
  }
}

async function deleteMenuItem(id) {
  if (isLive && db) await db.collection('menu').doc(id).delete();
  menu = menu.filter(function (m) { return m.id !== id; });
  if (!isLive) localStorage.setItem('jaidi-admin-menu', JSON.stringify(menu));
}

async function saveSettingsToStore(s) {
  if (isLive && db) await db.collection('settings').doc('shop').set(s, { merge: true });
  else localStorage.setItem('jaidi-admin-settings', JSON.stringify(s));
  settings = s;
}

async function savePromo(promo) {
  if (isLive && db) {
    var data = Object.assign({}, promo);
    delete data.id;
    if (promo.id && promo.id.indexOf('local-') !== 0) {
      await db.collection('promotions').doc(promo.id).set(data, { merge: true });
    } else {
      var ref = await db.collection('promotions').add(data);
      promo.id = ref.id;
    }
  } else {
    if (!promo.id) promo.id = 'local-' + Date.now();
    var idx = promos.findIndex(function (p) { return p.id === promo.id; });
    if (idx >= 0) promos[idx] = promo; else promos.push(promo);
    localStorage.setItem('jaidi-admin-promos', JSON.stringify(promos));
  }
}

async function deletePromoById(id) {
  if (isLive && db) await db.collection('promotions').doc(id).delete();
  promos = promos.filter(function (p) { return p.id !== id; });
  if (!isLive) localStorage.setItem('jaidi-admin-promos', JSON.stringify(promos));
}

async function handleLogin() {
  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  showLoginError('');
  if (!email || !password) { showLoginError('Please enter email and password'); return; }
  setLoginLoading(true);
  try {
    if (isLive && auth) {
      await auth.signInWithEmailAndPassword(email, password);
    } else {
      await new Promise(function (r) { setTimeout(r, 400); });
      openApp(email);
    }
  } catch (err) {
    showLoginError(err.message || 'Login failed');
  } finally {
    setLoginLoading(false);
  }
}

function handleLogout() {
  if (isLive && auth) auth.signOut();
  else closeApp();
}

function openApp(email) {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  document.getElementById('user-email').textContent = email || '';
  document.getElementById('mode-badge').textContent = isLive ? 'LIVE' : 'DEMO';
  document.getElementById('mode-badge').className = 'mode-badge' + (isLive ? ' live' : '');
  document.getElementById('info-box').innerHTML = isLive
    ? '<p>Connected to <strong>Firebase</strong>. Changes appear instantly in the customer app.</p>'
    : '<p>Changes are saved to <strong>local storage</strong> (demo mode). Once Firebase is connected they update the live mobile app instantly.</p>';
  var note = document.getElementById('demo-note');
  if (note) note.style.display = isLive ? 'none' : 'block';

  loadAllData().then(function () {
    refreshDashboard();
    renderMenu();
    fillSettingsForm();
    renderPromos();
  });
}

function closeApp() {
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-password').value = '';
  showLoginError('');
}

if (isLive && auth) {
  auth.onAuthStateChanged(function (user) {
    if (user) openApp(user.email);
    else closeApp();
  });
}

document.getElementById('login-btn').addEventListener('click', handleLogin);
document.getElementById('login-password').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') handleLogin();
});
document.getElementById('logout-btn').addEventListener('click', handleLogout);

document.querySelectorAll('.tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

function refreshDashboard() {
  document.getElementById('dash-status').textContent = settings.isOpen ? 'Open' : 'Closed';
  document.getElementById('dash-wait').textContent = (settings.waitMinutes || 0) + ' min';
  document.getElementById('dash-items').textContent = menu.length;
  document.getElementById('dash-special').textContent = settings.todaySpecial && settings.todaySpecial.name
    ? settings.todaySpecial.name + ' (Rs. ' + settings.todaySpecial.price + ')'
    : '—';
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMenu() {
  var list = document.getElementById('menu-list');
  if (menu.length === 0) {
    list.innerHTML = '<p style="color:#666;font-size:14px;padding:20px 0">No menu items yet.</p>';
    return;
  }
  list.innerHTML = menu.map(function (item) {
    return '<div class="menu-row"><div class="info"><div class="name">' +
      escapeHtml(item.name) +
      ' <span class="badge ' + (item.available !== false ? 'ok' : 'off') + '">' +
      (item.available !== false ? 'Available' : 'Out of stock') +
      '</span></div><div class="meta">' +
      (CAT_LABELS[item.cat] || item.cat) + ' · ' + escapeHtml(item.desc || '') +
      '</div></div><div class="price">Rs. ' + item.price +
      '</div><div class="row-actions">' +
      '<button class="icon-btn" data-edit="' + item.id + '" title="Edit">✏️</button>' +
      '<button class="icon-btn danger" data-delete="' + item.id + '" title="Delete">🗑️</button>' +
      '</div></div>';
  }).join('');

  list.querySelectorAll('[data-edit]').forEach(function (btn) {
    btn.addEventListener('click', function () { editItem(btn.dataset.edit); });
  });
  list.querySelectorAll('[data-delete]').forEach(function (btn) {
    btn.addEventListener('click', function () { deleteItem(btn.dataset.delete); });
  });
}

document.getElementById('add-item-btn').addEventListener('click', function () {
  document.getElementById('item-modal-title').textContent = 'Add Item';
  document.getElementById('item-id').value = '';
  document.getElementById('item-name').value = '';
  document.getElementById('item-desc').value = '';
  document.getElementById('item-price').value = '';
  document.getElementById('item-cat').value = 'pan';
  document.getElementById('item-available').checked = true;
  document.getElementById('item-modal').classList.remove('hidden');
});

function editItem(id) {
  var item = menu.find(function (m) { return m.id === id; });
  if (!item) return;
  document.getElementById('item-modal-title').textContent = 'Edit Item';
  document.getElementById('item-id').value = item.id;
  document.getElementById('item-name').value = item.name;
  document.getElementById('item-desc').value = item.desc || '';
  document.getElementById('item-price').value = item.price;
  document.getElementById('item-cat').value = item.cat;
  document.getElementById('item-available').checked = item.available !== false;
  document.getElementById('item-modal').classList.remove('hidden');
}

async function deleteItem(id) {
  if (!confirm('Delete this item permanently?')) return;
  setLoading(true);
  try {
    await deleteMenuItem(id);
    renderMenu();
    refreshDashboard();
    toast('Item deleted');
  } catch (err) {
    toast('Delete failed: ' + err.message, true);
  } finally {
    setLoading(false);
  }
}

document.getElementById('item-cancel').addEventListener('click', function () {
  document.getElementById('item-modal').classList.add('hidden');
});

document.getElementById('item-save').addEventListener('click', async function () {
  var id = document.getElementById('item-id').value;
  var name = document.getElementById('item-name').value.trim();
  var desc = document.getElementById('item-desc').value.trim();
  var price = Number(document.getElementById('item-price').value);
  var cat = document.getElementById('item-cat').value;
  var available = document.getElementById('item-available').checked;

  if (!name) { alert('Name is required'); return; }
  if (!price || price < 0) { alert('Valid price is required'); return; }

  var existing = menu.find(function (m) { return m.id === id; });
  var item = {
    id: id || String(Date.now()),
    name: name,
    desc: desc,
    price: price,
    cat: cat,
    available: available,
    order: existing ? (existing.order || 0) : menu.length + 1
  };

  setLoading(true);
  try {
    await saveMenuItem(item);
    var idx = menu.findIndex(function (m) { return m.id === item.id; });
    if (idx >= 0) menu[idx] = item; else menu.push(item);
    renderMenu();
    refreshDashboard();
    document.getElementById('item-modal').classList.add('hidden');
    toast(id ? 'Item updated' : 'Item added');
  } catch (err) {
    toast('Save failed: ' + err.message, true);
  } finally {
    setLoading(false);
  }
});

function fillSettingsForm() {
  document.getElementById('set-isOpen').checked = settings.isOpen !== false;
  document.getElementById('set-wait').value = settings.waitMinutes != null ? settings.waitMinutes : 7;
  document.getElementById('set-special-name').value = (settings.todaySpecial && settings.todaySpecial.name) || '';
  document.getElementById('set-special-price').value = (settings.todaySpecial && settings.todaySpecial.price) || '';
  document.getElementById('set-whatsapp').value = settings.whatsapp || '';
  document.getElementById('set-address').value = settings.address || '';
}

document.getElementById('save-settings-btn').addEventListener('click', async function () {
  var next = Object.assign({}, settings, {
    isOpen: document.getElementById('set-isOpen').checked,
    waitMinutes: Number(document.getElementById('set-wait').value) || 0,
    todaySpecial: {
      name: document.getElementById('set-special-name').value.trim(),
      price: Number(document.getElementById('set-special-price').value) || 0
    },
    whatsapp: document.getElementById('set-whatsapp').value.trim(),
    address: document.getElementById('set-address').value.trim()
  });

  setLoading(true);
  try {
    await saveSettingsToStore(next);
    refreshDashboard();
    toast('Settings saved');
  } catch (err) {
    toast('Save failed: ' + err.message, true);
  } finally {
    setLoading(false);
  }
});

function renderPromos() {
  var list = document.getElementById('promo-list');
  if (promos.length === 0) {
    list.innerHTML = '<p style="color:#666;font-size:14px">No promotions yet.</p>';
    return;
  }
  list.innerHTML = promos.map(function (p) {
    return '<div class="promo-card"><div class="title">' +
      escapeHtml(p.title) +
      ' <span class="badge ' + (p.active ? 'ok' : 'off') + '">' + (p.active ? 'Active' : 'Inactive') +
      '</span></div><div class="desc">' + escapeHtml(p.description || '') +
      '</div><div style="margin-top:8px"><button class="icon-btn danger" data-del-promo="' + p.id + '">🗑️</button></div></div>';
  }).join('');

  list.querySelectorAll('[data-del-promo]').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      if (!confirm('Delete this promotion?')) return;
      setLoading(true);
      try {
        await deletePromoById(btn.dataset.delPromo);
        renderPromos();
        toast('Promotion deleted');
      } catch (err) {
        toast('Delete failed: ' + err.message, true);
      } finally {
        setLoading(false);
      }
    });
  });
}

document.getElementById('add-promo-btn').addEventListener('click', function () {
  document.getElementById('promo-title').value = '';
  document.getElementById('promo-desc').value = '';
  document.getElementById('promo-active').checked = true;
  document.getElementById('promo-modal').classList.remove('hidden');
});

document.getElementById('promo-cancel').addEventListener('click', function () {
  document.getElementById('promo-modal').classList.add('hidden');
});

document.getElementById('promo-save').addEventListener('click', async function () {
  var title = document.getElementById('promo-title').value.trim();
  if (!title) { alert('Title is required'); return; }

  var promo = {
    title: title,
    description: document.getElementById('promo-desc').value.trim(),
    active: document.getElementById('promo-active').checked
  };

  setLoading(true);
  try {
    await savePromo(promo);
    if (!promos.find(function (p) { return p.id === promo.id; })) promos.push(promo);
    renderPromos();
    document.getElementById('promo-modal').classList.add('hidden');
    toast('Promotion added');
  } catch (err) {
    toast('Save failed: ' + err.message, true);
  } finally {
    setLoading(false);
  }
});

// ---------- Loyalty (Admin) ----------
var currentLoyaltyCustomer = null;
var LOYALTY_STAMPS_REQUIRED = 10;
var LOYALTY_REWARD = 'Free Meetha Pan';

function normalizePhoneAdmin(raw) {
  var p = String(raw).replace(/\D/g, '');
  if (p.indexOf('0') === 0 && p.length === 11) p = '92' + p.slice(1);
  if (p.length === 10) p = '92' + p;
  return p;
}

async function loyaltyLoadCustomers() {
  if (isLive && db) {
    var snap = await db.collection('customers').get();
    return snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
  }
  var raw = localStorage.getItem('jaidi-admin-customers');
  return raw ? JSON.parse(raw) : [];
}

async function loyaltySaveCustomers(list) {
  if (!isLive) localStorage.setItem('jaidi-admin-customers', JSON.stringify(list));
}

async function loyaltyFindByPhone(phone) {
  var n = normalizePhoneAdmin(phone);
  if (isLive && db) {
    var snap = await db.collection('customers').where('phone', '==', n).limit(1).get();
    if (snap.empty) return null;
    var d = snap.docs[0];
    return Object.assign({ id: d.id }, d.data());
  }
  var list = await loyaltyLoadCustomers();
  return list.find(function (c) { return c.phone === n; }) || null;
}

async function loyaltyCreate(phone, name) {
  var n = normalizePhoneAdmin(phone);
  var customer = {
    name: name || 'Customer',
    phone: n,
    totalStamps: 0,
    totalOrders: 0
  };
  if (isLive && db) {
    var ref = await db.collection('customers').add(Object.assign({}, customer, {
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }));
    customer.id = ref.id;
  } else {
    customer.id = 'local-' + Date.now();
    var list = await loyaltyLoadCustomers();
    list.push(customer);
    await loyaltySaveCustomers(list);
  }
  return customer;
}

async function loyaltyAddStamp(customer) {
  var next = (customer.totalStamps || 0) + 1;
  var orders = (customer.totalOrders || 0) + 1;
  if (isLive && db) {
    await db.collection('customers').doc(customer.id).update({
      totalStamps: next,
      totalOrders: orders,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } else {
    var list = await loyaltyLoadCustomers();
    var idx = list.findIndex(function (c) { return c.id === customer.id; });
    if (idx >= 0) {
      list[idx].totalStamps = next;
      list[idx].totalOrders = orders;
      await loyaltySaveCustomers(list);
    }
  }
  customer.totalStamps = next;
  customer.totalOrders = orders;
  return customer;
}

async function loyaltyRedeem(customer) {
  if ((customer.totalStamps || 0) < LOYALTY_STAMPS_REQUIRED) {
    throw new Error('Not enough stamps');
  }
  var next = customer.totalStamps - LOYALTY_STAMPS_REQUIRED;
  if (isLive && db) {
    await db.collection('customers').doc(customer.id).update({
      totalStamps: next,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('rewards').add({
      customerId: customer.id,
      customerPhone: customer.phone,
      stampsUsed: LOYALTY_STAMPS_REQUIRED,
      rewardType: LOYALTY_REWARD,
      redeemedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } else {
    var list = await loyaltyLoadCustomers();
    var idx = list.findIndex(function (c) { return c.id === customer.id; });
    if (idx >= 0) {
      list[idx].totalStamps = next;
      await loyaltySaveCustomers(list);
    }
  }
  customer.totalStamps = next;
  return customer;
}

function showLoyaltyResult(c) {
  currentLoyaltyCustomer = c;
  document.getElementById('loyalty-result').classList.remove('hidden');
  document.getElementById('loyalty-empty').classList.add('hidden');
  document.getElementById('loy-name').textContent = c.name || '—';
  document.getElementById('loy-stamps').textContent = c.totalStamps || 0;
  document.getElementById('loy-orders').textContent = c.totalOrders || 0;
  document.getElementById('loy-phone').textContent = c.phone || '—';
}

document.getElementById('loyalty-lookup-btn').addEventListener('click', async function () {
  var phone = document.getElementById('loyalty-phone').value.trim();
  if (!phone) { alert('Enter a phone number'); return; }
  setLoading(true);
  try {
    var c = await loyaltyFindByPhone(phone);
    if (c) {
      showLoyaltyResult(c);
      toast('Customer found');
    } else {
      currentLoyaltyCustomer = null;
      document.getElementById('loyalty-result').classList.remove('hidden');
      document.getElementById('loyalty-empty').classList.add('hidden');
      document.getElementById('loy-name').textContent = 'Not registered';
      document.getElementById('loy-stamps').textContent = '0';
      document.getElementById('loy-orders').textContent = '0';
      document.getElementById('loy-phone').textContent = normalizePhoneAdmin(phone);
      toast('Not found — you can register below');
    }
  } catch (err) {
    toast('Lookup failed: ' + err.message, true);
  } finally {
    setLoading(false);
  }
});

document.getElementById('loy-add-stamp').addEventListener('click', async function () {
  if (!currentLoyaltyCustomer) {
    alert('Look up or register a customer first');
    return;
  }
  setLoading(true);
  try {
    currentLoyaltyCustomer = await loyaltyAddStamp(currentLoyaltyCustomer);
    showLoyaltyResult(currentLoyaltyCustomer);
    toast('Stamp added');
  } catch (err) {
    toast('Failed: ' + err.message, true);
  } finally {
    setLoading(false);
  }
});

document.getElementById('loy-redeem').addEventListener('click', async function () {
  if (!currentLoyaltyCustomer) {
    alert('Look up a customer first');
    return;
  }
  if (!confirm('Redeem ' + LOYALTY_STAMPS_REQUIRED + ' stamps for ' + LOYALTY_REWARD + '?')) return;
  setLoading(true);
  try {
    currentLoyaltyCustomer = await loyaltyRedeem(currentLoyaltyCustomer);
    showLoyaltyResult(currentLoyaltyCustomer);
    toast('Reward redeemed!');
  } catch (err) {
    toast(err.message || 'Redeem failed', true);
  } finally {
    setLoading(false);
  }
});

document.getElementById('loy-register').addEventListener('click', async function () {
  var phone = document.getElementById('loyalty-phone').value.trim();
  var name = document.getElementById('loy-new-name').value.trim();
  if (!phone) { alert('Enter phone number above'); return; }
  if (!name) { alert('Enter customer name'); return; }
  setLoading(true);
  try {
    var existing = await loyaltyFindByPhone(phone);
    if (existing) {
      currentLoyaltyCustomer = await loyaltyAddStamp(existing);
      showLoyaltyResult(currentLoyaltyCustomer);
      toast('Already registered — stamp added');
    } else {
      var c = await loyaltyCreate(phone, name);
      c = await loyaltyAddStamp(c);
      showLoyaltyResult(c);
      toast('Registered + 1 stamp added');
    }
  } catch (err) {
    toast('Failed: ' + err.message, true);
  } finally {
    setLoading(false);
  }
});

// ---------- Notifications (Admin) ----------
async function loadNotifHistory() {
  var list = [];
  if (isLive && db) {
    try {
      var snap = await db.collection('notifications').orderBy('createdAt', 'desc').limit(20).get();
      list = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    } catch (e) {
      console.warn(e);
    }
  } else {
    var raw = localStorage.getItem('jaidi-admin-notifications');
    list = raw ? JSON.parse(raw) : [];
  }
  var el = document.getElementById('notif-history');
  if (!el) return;
  if (list.length === 0) {
    el.innerHTML = '<p style="color:#666;font-size:14px">No notifications sent yet.</p>';
    return;
  }
  el.innerHTML = list.map(function (n) {
    var date = n.createdAt
      ? (n.createdAt.toDate ? n.createdAt.toDate().toLocaleString() : new Date(n.createdAt).toLocaleString())
      : '';
    return '<div class="promo-card"><div class="title">' + escapeHtml(n.title || '') +
      ' <span class="badge ok">' + (n.target || 'all') + '</span></div>' +
      '<div class="desc">' + escapeHtml(n.body || '') + '</div>' +
      '<div style="font-size:11px;color:#999;margin-top:6px">' + date +
      (n.status ? ' · ' + n.status : '') + '</div></div>';
  }).join('');
}

document.getElementById('send-notif-btn').addEventListener('click', async function () {
  var title = document.getElementById('notif-title').value.trim();
  var body = document.getElementById('notif-body').value.trim();
  var target = document.getElementById('notif-target').value;
  var screen = document.getElementById('notif-screen').value;

  if (!title || !body) {
    alert('Title and message are required');
    return;
  }

  var payload = {
    title: title,
    body: body,
    target: target,
    screen: screen || null,
    status: 'queued',
    createdAt: new Date().toISOString()
  };

  setLoading(true);
  try {
    if (isLive && db) {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('notifications').add(payload);
      // A Cloud Function should pick this up and send via FCM Admin SDK.
      // See firebase/functions/sendNotification.js for the template.
      toast('Notification queued — Cloud Function will deliver it');
    } else {
      var raw = localStorage.getItem('jaidi-admin-notifications');
      var list = raw ? JSON.parse(raw) : [];
      payload.id = 'local-' + Date.now();
      payload.status = 'demo-queued';
      list.unshift(payload);
      localStorage.setItem('jaidi-admin-notifications', JSON.stringify(list.slice(0, 50)));
      toast('Notification saved (DEMO mode — no real push sent)');
    }
    document.getElementById('notif-title').value = '';
    document.getElementById('notif-body').value = '';
    loadNotifHistory();
  } catch (err) {
    toast('Failed: ' + err.message, true);
  } finally {
    setLoading(false);
  }
});

// Load history when opening notifications tab
document.querySelectorAll('.tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    if (tab.dataset.tab === 'notifications') loadNotifHistory();
  });
});
