// Barista screen — cola de pedidos en tiempo real con Firestore
// Acceso: botón "Barista →" en el panel Tweaks o en la pantalla Attract

const STEP_LABELS = {
  es: ['Recibido', 'Preparando', 'Casi listo', '¡Listo!'],
  en: ['Received',  'Preparing',  'Almost done', 'Ready!'],
};

const STATUS_COLOR = {
  pending_cash: '#d97706',
  pending:      '#0284c7',
  preparing:    '#7c3aed',
  ready:        '#059669',
};

const STATUS_LABEL = {
  es: { pending_cash: 'Esperando caja', pending: 'En cola', preparing: 'Preparando', ready: 'Listo' },
  en: { pending_cash: 'Awaiting payment', pending: 'Queued', preparing: 'Preparing', ready: 'Ready' },
};

function ScreenBarista({ t, lang, onExit }) {
  const [orders, setOrders]         = React.useState([]);
  const [history, setHistory]       = React.useState([]);
  const [tab, setTab]               = React.useState('queue'); // 'queue' | 'history'
  const [actionMsg, setActionMsg]   = React.useState('');
  const [loading, setLoading]       = React.useState(true);
  const [now, setNow]               = React.useState(new Date());

  // Reloj en tiempo real
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Suscripción en tiempo real — cola activa (sin orderBy para evitar índice compuesto)
  React.useEffect(() => {
    const q = db.collection('orders')
      .where('branchId', '==', 'branch-001')
      .where('status', 'in', ['pending_cash', 'pending', 'preparing']);

    const unsub = q.onSnapshot(
      snap => {
        const sorted = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setOrders(sorted);
        setLoading(false);
      },
      err => {
        console.error('Barista queue error:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  // Suscripción en tiempo real — historial (ready/delivered)
  React.useEffect(() => {
    if (tab !== 'history') return;
    const q = db.collection('orders')
      .where('branchId', '==', 'branch-001')
      .where('status', 'in', ['ready', 'delivered'])
      .limit(20);

    const unsub = q.onSnapshot(
      snap => {
        const sorted = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setHistory(sorted);
      },
      err => console.error('History error:', err)
    );
    return unsub;
  }, [tab]);

  function flash(msg) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 2500);
  }

  async function advanceStep(order) {
    const currentStep = order.preparationStep || 0;
    const nextStep    = currentStep + 1;

    if (nextStep >= 3) {
      await markReady(order);
    } else {
      try {
        await db.collection('orders').doc(order.id).update({
          preparationStep: nextStep,
          status: 'preparing',
        });
        flash(lang === 'es' ? `Paso ${nextStep + 1}/3 — ${STEP_LABELS.es[nextStep]}` : `Step ${nextStep + 1}/3 — ${STEP_LABELS.en[nextStep]}`);
      } catch (err) {
        console.error('advanceStep error:', err);
      }
    }
  }

  async function markReady(order) {
    try {
      await db.collection('orders').doc(order.id).update({
        status: 'ready',
        preparationStep: 3,
      });
      // Registrar venta en colección `sales`
      await recordSaleInFirestore(order);
      // Asignar puntos si es usuario registrado (para efectivo, aquí se asignan)
      if (order.clientId && !order.clientId.startsWith('guest') && !order.clientId.startsWith('phone-')) {
        await awardPointsInFirestore(order.clientId, order.id, order.total);
      }
      flash(lang === 'es'
        ? `✓ Pedido #${order.id.slice(-4).toUpperCase()} listo · Venta registrada`
        : `✓ Order #${order.id.slice(-4).toUpperCase()} ready · Sale recorded`);
    } catch (err) {
      console.error('markReady error:', err);
    }
  }

  async function approveCash(order) {
    try {
      await db.collection('orders').doc(order.id).update({ status: 'pending' });
      flash(lang === 'es' ? 'Pago en efectivo aprobado ✓' : 'Cash payment approved ✓');
    } catch (err) {
      console.error('approveCash error:', err);
    }
  }

  async function denyCash(order) {
    try {
      await db.collection('orders').doc(order.id).update({ status: 'delivered' });
      flash(lang === 'es' ? 'Pedido cancelado' : 'Order cancelled');
    } catch (err) {
      console.error('denyCash error:', err);
    }
  }

  function minutesAgo(order) {
    if (!order.createdAt?.seconds) return '';
    const mins = Math.round((now - new Date(order.createdAt.seconds * 1000)) / 60000);
    if (mins < 1) return lang === 'es' ? 'ahora' : 'just now';
    return `${mins}min`;
  }

  // Distribuir pedidos en 2 carriles (Barista 1 / Barista 2)
  const lane1 = orders.filter((_, i) => i % 2 === 0);
  const lane2 = orders.filter((_, i) => i % 2 === 1);

  return (
    <div data-screen-label="Barista" style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#1a1612',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              CONCEFFE · BARISTA STATION
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              {now.toLocaleTimeString(lang === 'es' ? 'es-MX' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginLeft: 8, fontWeight: 400 }}>
                {now.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginLeft: 24, background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: 4 }}>
            {[
              { k: 'queue',   label: lang === 'es' ? `Cola (${orders.length})` : `Queue (${orders.length})` },
              { k: 'history', label: lang === 'es' ? 'Historial' : 'History' },
            ].map(tb => (
              <button key={tb.k} onClick={() => setTab(tb.k)} style={{
                padding: '8px 18px', borderRadius: 999,
                background: tab === tb.k ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: tab === tb.k ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
              }}>{tb.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {actionMsg && (
            <div style={{
              padding: '8px 16px', borderRadius: 999,
              background: 'rgba(5,150,105,0.2)', border: '1px solid rgba(5,150,105,0.4)',
              color: '#34d399', fontSize: 13, fontWeight: 600,
              animation: 'softFade 300ms',
            }}>{actionMsg}</div>
          )}
          <button onClick={onExit} style={{
            padding: '10px 20px', borderRadius: 999,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600,
          }}>← {lang === 'es' ? 'Salir' : 'Exit'}</button>
        </div>
      </div>

      {/* Body */}
      {tab === 'queue' && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: 0 }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>
              {lang === 'es' ? 'Conectando…' : 'Connecting…'}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div className="kr" style={{ fontSize: 64, opacity: 0.08, color: '#fff' }}>콘</div>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 18, fontWeight: 500 }}>
                {lang === 'es' ? 'Sin pedidos en cola' : 'No orders in queue'}
              </div>
            </div>
          ) : (
            <>
              <BaristaLane
                label={lang === 'es' ? 'Barista 1' : 'Barista 1'}
                orders={lane1} lang={lang}
                onAdvance={advanceStep} onMarkReady={markReady}
                onApproveCash={approveCash} onDenyCash={denyCash}
                minutesAgo={minutesAgo}
              />
              <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
              <BaristaLane
                label={lang === 'es' ? 'Barista 2' : 'Barista 2'}
                orders={lane2} lang={lang}
                onAdvance={advanceStep} onMarkReady={markReady}
                onApproveCash={approveCash} onDenyCash={denyCash}
                minutesAgo={minutesAgo}
              />
            </>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 15, textAlign: 'center', paddingTop: 40 }}>
                {lang === 'es' ? 'Sin historial aún' : 'No history yet'}
              </div>
            )}
            {history.map(order => (
              <div key={order.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 18px', borderRadius: 'var(--r-md)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#fff', minWidth: 48 }}>
                  #{order.id.slice(-4).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                    {order.clientName || 'Invitado'}
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, marginLeft: 8 }}>
                      {(order.items || []).map(i => `${i.quantity}× ${i.productName}`).join(', ')}
                    </span>
                  </div>
                </div>
                <div className="mono" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                  ${order.total}
                </div>
                <div style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: order.status === 'ready' ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.07)',
                  color: order.status === 'ready' ? '#34d399' : 'rgba(255,255,255,0.4)',
                }}>
                  {(STATUS_LABEL[lang] || STATUS_LABEL.es)[order.status] || order.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BaristaLane({ label, orders, lang, onAdvance, onMarkReady, onApproveCash, onDenyCash, minutesAgo }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Lane header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
          {label.toUpperCase()} · {orders.length} {lang === 'es' ? 'pedido' + (orders.length !== 1 ? 's' : '') : 'order' + (orders.length !== 1 ? 's' : '')}
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            lang={lang}
            onAdvance={onAdvance}
            onMarkReady={onMarkReady}
            onApproveCash={onApproveCash}
            onDenyCash={onDenyCash}
            timeAgo={minutesAgo(order)}
          />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, lang, onAdvance, onMarkReady, onApproveCash, onDenyCash, timeAgo }) {
  const step    = order.preparationStep || 0;
  const isCash  = order.status === 'pending_cash';
  const total3  = STEP_LABELS[lang] || STEP_LABELS.es;

  const accentColor = STATUS_COLOR[order.status] || '#888';

  return (
    <div style={{
      borderRadius: 'var(--r-lg)',
      background: 'rgba(255,255,255,0.05)',
      border: `1px solid rgba(255,255,255,0.09)`,
      overflow: 'hidden',
    }}>
      {/* Top accent bar */}
      <div style={{ height: 3, background: accentColor }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                #{order.id.slice(-4).toUpperCase()}
              </div>
              <div style={{
                padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                background: `${accentColor}25`, color: accentColor, letterSpacing: '0.06em',
              }}>
                {(STATUS_LABEL[lang] || STATUS_LABEL.es)[order.status] || order.status}
              </div>
              {order.orderType === 'llevar' && (
                <div style={{
                  padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                  background: 'rgba(124,58,237,0.2)', color: '#a78bfa', letterSpacing: '0.06em',
                }}>
                  {lang === 'es' ? 'LLEVAR' : 'TO GO'}
                </div>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
              {order.clientName || 'Invitado'} · {timeAgo}
            </div>
          </div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
            ${order.total}
          </div>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          {(order.items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
              <div className="mono" style={{ color: 'rgba(255,255,255,0.4)', minWidth: 20 }}>{item.quantity}×</div>
              <div style={{ flex: 1, color: '#fff' }}>
                {item.productName}
                {(item.selectedSize || (item.extras && item.extras.length > 0)) && (
                  <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 6, fontSize: 11 }}>
                    {[item.selectedSize, ...(item.extras || [])].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar (pasos) — solo para pedidos activos */}
        {!isCash && order.status !== 'ready' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              {total3.slice(0, 3).map((lbl, i) => (
                <div key={i} style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                  color: i <= step ? accentColor : 'rgba(255,255,255,0.2)',
                }}>{lbl.toUpperCase()}</div>
              ))}
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                width: `${Math.min(100, (step / 2) * 100)}%`,
                background: accentColor,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        {/* Actions */}
        {isCash ? (
          // Pedido efectivo — necesita aprobación
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onDenyCash(order)} style={{
              flex: 1, padding: '10px 0', borderRadius: 'var(--r-sm)',
              background: 'rgba(184,95,66,0.15)', border: '1px solid rgba(184,95,66,0.3)',
              color: '#f87171', fontSize: 13, fontWeight: 600,
            }}>
              {lang === 'es' ? '✕ Rechazar' : '✕ Deny'}
            </button>
            <button onClick={() => onApproveCash(order)} style={{
              flex: 2, padding: '10px 0', borderRadius: 'var(--r-sm)',
              background: 'rgba(217,119,6,0.2)', border: '1px solid rgba(217,119,6,0.4)',
              color: '#fbbf24', fontSize: 13, fontWeight: 700,
            }}>
              {lang === 'es' ? '$ Aprobar pago' : '$ Approve payment'}
            </button>
          </div>
        ) : order.status === 'ready' ? (
          <div style={{
            padding: '10px 0', borderRadius: 'var(--r-sm)', textAlign: 'center',
            background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.25)',
            color: '#34d399', fontSize: 13, fontWeight: 700,
          }}>
            ✓ {lang === 'es' ? 'Listo para recoger' : 'Ready for pickup'}
          </div>
        ) : step < 2 ? (
          <button onClick={() => onAdvance(order)} style={{
            width: '100%', padding: '11px 0', borderRadius: 'var(--r-sm)',
            background: `${accentColor}20`, border: `1px solid ${accentColor}50`,
            color: accentColor, fontSize: 13, fontWeight: 700,
          }}>
            {lang === 'es' ? `Avanzar → ${total3[step + 1]}` : `Next → ${STEP_LABELS.en[step + 1]}`}
          </button>
        ) : (
          <button onClick={() => onMarkReady(order)} style={{
            width: '100%', padding: '11px 0', borderRadius: 'var(--r-sm)',
            background: 'rgba(5,150,105,0.2)', border: '1px solid rgba(5,150,105,0.45)',
            color: '#34d399', fontSize: 14, fontWeight: 700,
          }}>
            {lang === 'es' ? '✓ Marcar como listo' : '✓ Mark as ready'}
          </button>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenBarista });
