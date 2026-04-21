// Firebase config — proyecto koncafe-106af
// API key es pública (segura en frontend, protegida por Firestore rules + Auth domains)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCmIC3RarCdzAVqIF57XLoN4ZMJmNNPmus",
  authDomain: "koncafe-106af.firebaseapp.com",
  projectId: "koncafe-106af",
  storageBucket: "koncafe-106af.firebasestorage.app",
  messagingSenderId: "35968353498",
  appId: "1:35968353498:web:b2492890113ba557ee91e3",
};

firebase.initializeApp(FIREBASE_CONFIG);

const db   = firebase.firestore();
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ── Helpers globales reutilizados por todas las pantallas ────────────────────

function getISOWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function toLocalDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

// Registra venta en colección `sales` — idempotente (docId = orderId)
async function recordSaleInFirestore(order) {
  try {
    const now = new Date();
    await db.collection('sales').doc(order.id).set({
      id: order.id,
      orderId: order.id,
      branchId: order.branchId || 'branch-001',
      client: {
        id: order.clientId || 'guest',
        name: order.clientName || 'Invitado',
      },
      time: {
        soldAt: firebase.firestore.FieldValue.serverTimestamp(),
        date: toLocalDate(now),
        weekKey: getISOWeekKey(now),
        yearMonth: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`,
        year: now.getFullYear(),
        dayOfWeek: now.getDay(),
        hour: now.getHours(),
      },
      payment: { method: order.paymentMethod || 'cash' },
      fulfillment: { type: order.orderType || 'aqui' },
      items: (order.items || []).map(item => ({
        product: { id: item.productId, name: item.productName, category: item.category || 'bebidas' },
        size: { name: item.selectedSize || '', priceModifier: 0 },
        extras: (item.extras || []).map(e => ({ name: e, price: 0, cost: 0, margin: 0 })),
        quantity: item.quantity || 1,
        pricing: {
          basePrice: item.price || 0,
          baseCost: 0,
          unitPrice: item.price || 0,
          unitCost: 0,
          lineRevenue: (item.price || 0) * (item.quantity || 1),
          lineCost: 0,
          lineMargin: (item.price || 0) * (item.quantity || 1),
        },
      })),
      totals: {
        revenue: order.total || 0,
        cost: 0,
        margin: order.total || 0,
        marginPercent: 100,
        itemCount: (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0),
      },
    });
  } catch (err) {
    console.error('recordSale error:', err);
  }
}

// Asigna puntos al usuario registrado (1 punto por cada $10 MXN)
async function awardPointsInFirestore(userId, orderId, orderTotal) {
  if (!userId || userId.startsWith('guest')) return 0;
  const stars = Math.floor(orderTotal / 10);
  if (stars === 0) return 0;
  try {
    await db.collection('users').doc(userId).update({
      points: firebase.firestore.FieldValue.increment(stars),
      totalSpent: firebase.firestore.FieldValue.increment(orderTotal),
    });
    await db.collection('users').doc(userId).collection('pointsTransactions').add({
      orderId,
      points: stars,
      type: 'earned',
      description: `Pedido #${orderId.slice(-6).toUpperCase()} — $${Math.round(orderTotal)} MXN`,
      createdAt: firebase.firestore.Timestamp.now(),
    });
    return stars;
  } catch (err) {
    console.error('awardPoints error:', err);
    return 0;
  }
}

// Obtiene o crea documento de usuario en Firestore después de auth
async function getOrCreateUser(firebaseUser) {
  const ref = db.collection('users').doc(firebaseUser.uid);
  const snap = await ref.get();
  if (snap.exists) {
    return snap.data();
  }
  const newUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || 'Usuario',
    role: 'client',
    points: 0,
    tier: 'verde',
    totalSpent: 0,
    branchId: 'branch-001',
  };
  await ref.set(newUser);
  return newUser;
}
