// User profile screen — points, tier, order history, transactions
function ScreenProfile({ t, lang, user, onBack, onSignOut }) {
  const [tab, setTab]             = React.useState('orders');
  const [orders, setOrders]       = React.useState([]);
  const [txs, setTxs]             = React.useState([]);
  const [loadingOrders, setLO]    = React.useState(true);
  const [loadingTxs, setLT]       = React.useState(true);

  React.useEffect(() => {
    if (!user?.uid) return;
    const q = db.collection('orders')
      .where('clientId', '==', user.uid)
      .limit(15);
    const unsub = q.onSnapshot(
      snap => {
        const sorted = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(sorted);
        setLO(false);
      },
      err => { console.error('profile orders:', err); setLO(false); }
    );
    return unsub;
  }, [user?.uid]);

  React.useEffect(() => {
    if (!user?.uid || tab !== 'stars') return;
    const q = db.collection('users').doc(user.uid)
      .collection('pointsTransactions')
      .orderBy('createdAt', 'desc')
      .limit(20);
    const unsub = q.onSnapshot(
      snap => { setTxs(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLT(false); },
      err => { console.error('profile txs:', err); setLT(false); }
    );
    return unsub;
  }, [user?.uid, tab]);

  if (!user) return null;

  const points      = user.points || 0;
  const tier        = user.tier || 'verde';
  const isGold      = tier === 'oro';
  const nextMilestone = 150;
  const progress    = Math.min(100, (points % nextMilestone) / nextMilestone * 100);
  const starsToNext = nextMilestone - (points % nextMilestone);
  const tierLabel   = isGold
    ? (lang === 'es' ? 'Tier Oro ✦' : 'Gold Tier ✦')
    : (lang === 'es' ? 'Tier Verde' : 'Green Tier');
  const tierColor   = isGold ? '#d97706' : '#059669';

  function fmtDate(ts) {
    if (!ts?.seconds) return '';
    const d = new Date(ts.seconds * 1000);
    return d.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const STATUS_LABEL_P = {
    es: { pending_cash: 'Esperando caja', pending: 'En cola', preparing: 'Preparando', ready: 'Listo', delivered: 'Entregado' },
    en: { pending_cash: 'Pending payment', pending: 'Queued', preparing: 'Preparing', ready: 'Ready', delivered: 'Delivered' },
  };
  const STATUS_COLOR_P = { pending_cash: '#d97706', pending: '#0284c7', preparing: '#7c3aed', ready: '#059669', delivered: '#888' };

  return (
    <div data-screen-label="Profile" style={{ height: '100%', display: 'flex', background: 'var(--ivory)' }}>
      {/* LEFT sidebar */}
      <div style={{
        width: 380, background: 'var(--cream)',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid var(--mist)',
        padding: '36px 32px',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px 10px 10px', borderRadius: 999, background: 'var(--ivory)',
          fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-xs)', marginBottom: 32,
        }}>
          {Icon.back} <span>{t.back}</span>
        </button>

        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: 999,
          background: 'var(--terracotta)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, fontWeight: 700,
        }}>{user.initial || 'U'}</div>

        <div className="t-h3" style={{ marginTop: 16, letterSpacing: '-0.025em' }}>{user.name}</div>
        {user.email && (
          <div className="t-sm" style={{ color: 'var(--taupe)', marginTop: 4 }}>{user.email}</div>
        )}

        {/* Tier badge */}
        <div style={{
          marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 999,
          background: isGold ? 'rgba(217,119,6,0.1)' : 'rgba(5,150,105,0.1)',
          border: `1px solid ${tierColor}40`,
          alignSelf: 'flex-start',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: tierColor }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: tierColor }}>{tierLabel}</span>
        </div>

        {/* Points card */}
        <div style={{
          marginTop: 24, padding: 24, borderRadius: 'var(--r-lg)',
          background: 'linear-gradient(135deg, var(--charcoal), #4a3f2f)',
          color: 'var(--ivory)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 999, background: 'rgba(217,119,87,0.25)', filter: 'blur(24px)' }} />
          <div className="t-micro" style={{ opacity: 0.6 }}>
            {lang === 'es' ? 'PUNTOS DISPONIBLES' : 'AVAILABLE POINTS'}
          </div>
          <div className="mono" style={{ fontSize: 52, fontWeight: 700, marginTop: 8, letterSpacing: '-0.03em' }}>
            {points.toLocaleString()}
          </div>
          <div className="kr" style={{ position: 'absolute', bottom: 12, right: 20, fontSize: 40, opacity: 0.12, color: '#fff' }}>콘</div>
        </div>

        {/* Progress to next reward */}
        {!isGold && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="t-xs" style={{ color: 'var(--taupe)' }}>
                {lang === 'es' ? 'Progreso a Tier Oro' : 'Progress to Gold Tier'}
              </span>
              <span className="t-xs mono" style={{ color: 'var(--terracotta)', fontWeight: 700 }}>
                {starsToNext} {lang === 'es' ? 'faltan' : 'to go'}
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--mist)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--terracotta), #e8845a)',
                transition: 'width 0.8s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="t-xs" style={{ color: 'var(--line)' }}>0</span>
              <span className="t-xs" style={{ color: 'var(--line)' }}>150 ⭐</span>
            </div>
          </div>
        )}
        {isGold && (
          <div style={{
            marginTop: 20, padding: '14px 18px', borderRadius: 'var(--r-md)',
            background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)',
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <div style={{ fontSize: 22 }}>🎁</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#d97706' }}>
                {lang === 'es' ? 'Bebida gratis disponible' : 'Free drink available'}
              </div>
              <div className="t-xs" style={{ color: 'var(--taupe)', marginTop: 2 }}>
                {lang === 'es' ? 'Muéstraselo al barista' : 'Show this to the barista'}
              </div>
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <button onClick={() => { auth.signOut(); onSignOut(); }} style={{
          padding: '14px', borderRadius: 'var(--r-md)',
          background: 'var(--ivory)', border: '1px solid var(--line)',
          fontSize: 14, fontWeight: 600, color: 'var(--taupe)',
          marginTop: 24,
        }}>
          {lang === 'es' ? 'Cerrar sesión' : 'Sign out'}
        </button>
      </div>

      {/* RIGHT main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, padding: '20px 32px 0',
          borderBottom: '1px solid var(--mist)',
        }}>
          {[
            { k: 'orders', label: lang === 'es' ? 'Mis pedidos' : 'My orders' },
            { k: 'stars',  label: lang === 'es' ? 'Mis estrellas' : 'My stars' },
          ].map(tb => (
            <button key={tb.k} onClick={() => setTab(tb.k)} style={{
              padding: '10px 20px', borderRadius: '8px 8px 0 0',
              background: tab === tb.k ? 'var(--ivory)' : 'transparent',
              borderTop: tab === tb.k ? '2px solid var(--terracotta)' : '2px solid transparent',
              borderLeft: tab === tb.k ? '1px solid var(--mist)' : '1px solid transparent',
              borderRight: tab === tb.k ? '1px solid var(--mist)' : '1px solid transparent',
              borderBottom: tab === tb.k ? '1px solid var(--ivory)' : '1px solid transparent',
              marginBottom: tab === tb.k ? -1 : 0,
              fontSize: 14, fontWeight: 600,
              color: tab === tb.k ? 'var(--charcoal)' : 'var(--taupe)',
            }}>{tb.label}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
          {tab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loadingOrders && (
                <div style={{ color: 'var(--taupe)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>
                  {lang === 'es' ? 'Cargando pedidos…' : 'Loading orders…'}
                </div>
              )}
              {!loadingOrders && orders.length === 0 && (
                <div style={{ textAlign: 'center', paddingTop: 60 }}>
                  <div className="kr" style={{ fontSize: 48, color: 'var(--mist)' }}>콘</div>
                  <div className="t-body" style={{ color: 'var(--taupe)', marginTop: 12 }}>
                    {lang === 'es' ? 'Aún no tienes pedidos' : 'No orders yet'}
                  </div>
                </div>
              )}
              {orders.map(order => {
                const sc = STATUS_COLOR_P[order.status] || '#888';
                const sl = (STATUS_LABEL_P[lang] || STATUS_LABEL_P.es)[order.status] || order.status;
                return (
                  <div key={order.id} style={{
                    padding: '18px 20px', borderRadius: 'var(--r-lg)',
                    background: 'var(--cream)', border: '1px solid var(--mist)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="mono" style={{ fontSize: 16, fontWeight: 700 }}>
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span style={{
                            padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                            background: `${sc}15`, color: sc,
                          }}>{sl}</span>
                        </div>
                        <div className="t-xs" style={{ color: 'var(--taupe)', marginTop: 4 }}>
                          {fmtDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>
                        ${order.total}
                      </div>
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(order.items || []).map((item, i) => (
                        <span key={i} style={{
                          padding: '4px 10px', borderRadius: 999,
                          background: 'var(--ivory)', fontSize: 12, fontWeight: 500,
                          color: 'var(--charcoal)',
                        }}>
                          {item.quantity}× {item.productName}
                        </span>
                      ))}
                    </div>
                    {order.status === 'ready' || order.status === 'delivered' ? (
                      <div style={{
                        marginTop: 10, fontSize: 12, color: '#059669', fontWeight: 600,
                      }}>
                        ⭐ +{Math.floor((order.total || 0) / 10)} {lang === 'es' ? 'estrellas ganadas' : 'stars earned'}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'stars' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loadingTxs && (
                <div style={{ color: 'var(--taupe)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>
                  {lang === 'es' ? 'Cargando historial…' : 'Loading history…'}
                </div>
              )}
              {!loadingTxs && txs.length === 0 && (
                <div style={{ textAlign: 'center', paddingTop: 60 }}>
                  <div className="kr" style={{ fontSize: 48, color: 'var(--mist)' }}>콘</div>
                  <div className="t-body" style={{ color: 'var(--taupe)', marginTop: 12 }}>
                    {lang === 'es' ? 'Aún no tienes transacciones' : 'No transactions yet'}
                  </div>
                </div>
              )}
              {txs.map(tx => (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', borderRadius: 'var(--r-md)',
                  background: 'var(--cream)', border: '1px solid var(--mist)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 999, flexShrink: 0,
                    background: tx.type === 'earned' ? 'rgba(5,150,105,0.12)' : 'rgba(217,119,87,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>
                    {tx.type === 'earned' ? '⭐' : '🎁'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--charcoal)' }}>
                      {tx.description || (tx.type === 'earned'
                        ? (lang === 'es' ? 'Puntos ganados' : 'Points earned')
                        : (lang === 'es' ? 'Canje de puntos' : 'Points redeemed'))}
                    </div>
                    <div className="t-xs" style={{ color: 'var(--taupe)', marginTop: 2 }}>
                      {fmtDate(tx.createdAt)}
                    </div>
                  </div>
                  <div className="mono" style={{
                    fontSize: 18, fontWeight: 700,
                    color: tx.type === 'earned' ? '#059669' : 'var(--terracotta)',
                  }}>
                    {tx.type === 'earned' ? '+' : '-'}{tx.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenProfile });
