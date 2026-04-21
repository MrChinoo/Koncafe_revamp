// Order confirmation
function ScreenConfirm({ t, lang, orderNumber, cart, total, method, earned, onReset, invoice }) {
  return (
    <div data-screen-label="07 Confirm" style={{
      position: 'relative', height: '100%', background: 'var(--ivory)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* soft backdrop rings */}
      <div style={{
        position: 'absolute', width: 800, height: 800, borderRadius: 999,
        background: 'radial-gradient(circle, rgba(217,119,87,0.08), transparent 60%)',
      }} />
      <div style={{
        position: 'absolute', width: 480, height: 480, borderRadius: 999,
        border: '1px solid rgba(217,119,87,0.15)',
        animation: 'pulseRing 3s ease-out infinite',
      }} />

      <div style={{
        width: 980, padding: 40, background: 'var(--cream)',
        borderRadius: 'var(--r-xl)', position: 'relative',
        boxShadow: 'var(--shadow-lg)',
        animation: 'softFade 500ms',
      }}>
        <div style={{ display: 'flex', gap: 40 }}>
          {/* LEFT: pickup number */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 14px', borderRadius: 999, background: 'var(--success)', color: '#fff',
              fontSize: 13, fontWeight: 600,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: '#fff' }} />
              {lang === 'es' ? 'Pago confirmado' : 'Payment confirmed'}
            </div>
            <div className="kr" style={{ fontSize: 28, color: 'var(--terracotta)', marginTop: 28, fontWeight: 700 }}>감사합니다</div>
            <div className="t-h1" style={{ marginTop: 6, letterSpacing: '-0.035em' }}>
              {t.thank_you}.
            </div>
            <div className="t-body-lg" style={{ color: 'var(--taupe)', marginTop: 12, maxWidth: 420 }}>
              {t.pickup}
            </div>

            <div style={{ marginTop: 40 }}>
              <div className="t-micro" style={{ color: 'var(--taupe)' }}>{t.order_number}</div>
              <div className="mono" style={{
                fontSize: 180, lineHeight: 0.9, fontWeight: 700,
                letterSpacing: '-0.04em', color: 'var(--charcoal)',
                marginTop: 10,
              }}>{String(orderNumber).padStart(3, '0')}</div>
            </div>
          </div>

          {/* RIGHT: receipt */}
          <div style={{
            width: 340, flexShrink: 0, padding: 28, background: 'var(--ivory)',
            borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Monogram size={32} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>KONCAFFE</div>
                <div className="t-xs mono" style={{ color: 'var(--taupe)' }}>TERM 03 · {new Date().toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US')}</div>
              </div>
            </div>

            <div style={{
              height: 1, background: 'transparent',
              backgroundImage: 'linear-gradient(to right, var(--line) 50%, transparent 50%)',
              backgroundSize: '8px 1px',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflow: 'auto' }}>
              {cart.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
                  <div>
                    <span className="mono" style={{ color: 'var(--taupe)' }}>{it.qty}×</span> {lang === 'es' ? it.name_es : it.name_en}
                  </div>
                  <div className="mono" style={{ fontWeight: 600 }}>${it.unitPrice * it.qty}</div>
                </div>
              ))}
            </div>

            <div style={{
              height: 1, background: 'transparent',
              backgroundImage: 'linear-gradient(to right, var(--line) 50%, transparent 50%)',
              backgroundSize: '8px 1px',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Total</div>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700 }}>${total}</div>
            </div>
            <div className="t-xs" style={{ color: 'var(--taupe)' }}>
              {lang === 'es' ? 'Pagado con' : 'Paid with'} <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{method === 'card' ? t.card : t.cash}</span>
            </div>
            {invoice && (
              <div style={{
                padding: 10, background: 'var(--cream)', borderRadius: 'var(--r-sm)',
                fontSize: 12, color: 'var(--taupe)',
              }}>
                <div className="t-mono">{lang === 'es' ? 'FACTURA CFDI' : 'TAX INVOICE'}</div>
                <div className="mono" style={{ color: 'var(--charcoal)', marginTop: 4 }}>{invoice.rfc || '—'}</div>
                <div style={{ marginTop: 2 }}>{invoice.email}</div>
              </div>
            )}
            {earned > 0 && (
              <div style={{
                padding: 12, borderRadius: 'var(--r-sm)', background: 'var(--terracotta)',
                color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div className="t-xs" style={{ fontWeight: 600 }}>+{earned} {t.points_earned}</div>
                <div>{Icon.star}</div>
              </div>
            )}
          </div>
        </div>

        {/* bottom row */}
        <div style={{
          marginTop: 28, padding: 20, background: 'var(--ivory)', borderRadius: 'var(--r-md)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 40 }}>
            <div>
              <div className="t-micro" style={{ color: 'var(--taupe)' }}>{t.est}</div>
              <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>4–6 {t.mins}</div>
            </div>
            <div>
              <div className="t-micro" style={{ color: 'var(--taupe)' }}>{lang === 'es' ? 'ESTACIÓN' : 'STATION'}</div>
              <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>
                {lang === 'es' ? 'Barra principal' : 'Main counter'}
              </div>
            </div>
          </div>
          <button onClick={onReset} style={{
            padding: '14px 22px', borderRadius: 999, background: 'var(--charcoal)', color: '#fff',
            fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span>{t.new_order}</span>
            {Icon.arrow}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenConfirm });
