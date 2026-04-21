// Landscape iPad-style kiosk frame
function KioskFrame({ children, width = 1440, height = 960 }) {
  return (
    <div style={{
      width: width + 80, height: height + 80,
      background: 'linear-gradient(145deg, #3a342b 0%, #1a1612 100%)',
      borderRadius: 48, padding: 40,
      boxShadow: '0 60px 120px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
      position: 'relative',
    }}>
      {/* camera dot */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        width: 10, height: 10, borderRadius: 999,
        background: '#0a0805', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
      }} />
      <div style={{
        width, height, borderRadius: 16, overflow: 'hidden',
        background: 'var(--ivory)', position: 'relative',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
      }}>
        {children}
      </div>
    </div>
  );
}

// Top bar — brand + language + points badge (when logged in)
function TopBar({ t, lang, setLang, user, cart, onCart, onHome, step }) {
  const show = step !== 'attract';
  if (!show) return null;
  return (
    <div style={{
      height: 72, padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--mist)', background: 'var(--ivory)',
      flexShrink: 0,
    }}>
      <button onClick={onHome} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Monogram size={36} />
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
            KONCAFFE <span className="kr" style={{ color: 'var(--taupe)', fontWeight: 500, marginLeft: 4 }}>콘카페</span>
          </div>
          <div className="t-xs" style={{ color: 'var(--taupe)' }}>
            {lang === 'es' ? 'Kiosco de autoservicio' : 'Self-service kiosk'} · Terminal 03
          </div>
        </div>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 14px 8px 10px',
            background: 'var(--cream)', borderRadius: 999,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 999, background: 'var(--terracotta)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 12,
            }}>{user.initial}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
            <div style={{ width: 1, height: 16, background: 'var(--line)' }} />
            <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--terracotta)' }}>
              {user.points.toLocaleString()} <span style={{ color: 'var(--taupe)', fontWeight: 500 }}>pts</span>
            </div>
          </div>
        )}
        <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 999,
          background: 'transparent', border: '1px solid var(--line)',
          fontSize: 13, fontWeight: 600,
        }}>
          {Icon.globe}
          <span>{lang === 'es' ? 'ES' : 'EN'}</span>
          <span style={{ color: 'var(--taupe)', fontWeight: 500 }}>/ {lang === 'es' ? 'EN' : 'ES'}</span>
        </button>
        {cart.length > 0 && step !== 'cart' && step !== 'payment' && step !== 'confirm' && (
          <button onClick={onCart} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 18px 10px 14px',
            background: 'var(--charcoal)', color: 'var(--ivory)',
            borderRadius: 999, fontSize: 14, fontWeight: 600,
          }}>
            {Icon.bag}
            <span>{t.cart}</span>
            <span style={{
              minWidth: 22, height: 22, padding: '0 6px', borderRadius: 999,
              background: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>{cart.reduce((s, i) => s + i.qty, 0)}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Breadcrumb — thin stepper shown across flow
function FlowSteps({ step, lang }) {
  const order = ['menu','cart','loyalty','payment','confirm'];
  if (!order.includes(step)) return null;
  const labels = {
    es: ['Menú', 'Pedido', 'Lealtad', 'Pago', 'Listo'],
    en: ['Menu', 'Order', 'Loyalty', 'Payment', 'Ready'],
  }[lang];
  const idx = order.indexOf(step);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '0 32px',
      height: 40, background: 'var(--cream)', borderBottom: '1px solid var(--mist)',
    }}>
      {order.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            opacity: i <= idx ? 1 : 0.4,
          }}>
            <div className="mono" style={{
              width: 20, height: 20, borderRadius: 999,
              background: i < idx ? 'var(--charcoal)' : i === idx ? 'var(--terracotta)' : 'transparent',
              border: i === idx || i < idx ? 'none' : '1px solid var(--line)',
              color: i <= idx ? '#fff' : 'var(--taupe)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
            }}>{i < idx ? '✓' : String(i+1).padStart(2,'0').slice(-1)}</div>
            <span className="t-xs" style={{ color: i === idx ? 'var(--charcoal)' : 'var(--taupe)', fontWeight: i === idx ? 700 : 500 }}>
              {labels[i]}
            </span>
          </div>
          {i < order.length - 1 && (
            <div style={{ flex: 'none', width: 24, height: 1, background: 'var(--line)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

Object.assign(window, { KioskFrame, TopBar, FlowSteps });
