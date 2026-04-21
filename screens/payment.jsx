// Payment screen — method selection + per-method interactions + invoice
function ScreenPayment({ t, lang, cart, user, promo, redeem, onBack, onDone }) {
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const promoDiscount = promo ? Math.round(subtotal * 0.15) : 0;
  const total = Math.max(0, subtotal - promoDiscount - (redeem || 0));

  const [method, setMethod] = React.useState(null); // 'card' | 'cash' | null
  const [wantsInvoice, setWantsInvoice] = React.useState(false);
  const [invoice, setInvoice] = React.useState({ rfc: '', email: '', business: '' });
  const [cashGiven, setCashGiven] = React.useState(0);
  const [phase, setPhase] = React.useState('choose'); // choose | cardWait | cardOk | cashWait | cashOk

  const completeOrder = () => onDone({ method, total, invoice: wantsInvoice ? invoice : null });

  return (
    <div data-screen-label="06 Payment" style={{ height: '100%', display: 'flex', background: 'var(--ivory)' }}>
      <div style={{ flex: 1, padding: '28px 40px 32px', overflow: 'auto' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px 10px 10px', borderRadius: 999, background: 'var(--cream)',
          fontSize: 14, fontWeight: 600, marginBottom: 20,
        }}>{Icon.back} <span>{lang === 'es' ? 'Atrás' : 'Back'}</span></button>

        <div className="t-micro" style={{ color: 'var(--taupe)' }}>{t.payment}</div>
        <h1 className="t-h1" style={{ margin: '4px 0 24px' }}>
          {lang === 'es' ? '¿Cómo deseas pagar?' : 'How would you like to pay?'}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { k: 'card', icon: Icon.card, name: t.card, sub: lang === 'es' ? 'Inserta, desliza o contactless' : 'Insert, swipe or contactless' },
            { k: 'cash', icon: Icon.cash, name: t.cash, sub: lang === 'es' ? 'Billetes y monedas' : 'Bills and coins' },
          ].map(m => (
            <button key={m.k} onClick={() => { setMethod(m.k); setPhase(m.k + 'Wait'); }} style={{
              padding: 28, borderRadius: 'var(--r-lg)',
              background: method === m.k ? 'var(--charcoal)' : 'var(--cream)',
              color: method === m.k ? 'var(--ivory)' : 'var(--charcoal)',
              display: 'flex', alignItems: 'center', gap: 20, textAlign: 'left',
              border: method === m.k ? '2px solid var(--terracotta)' : '2px solid transparent',
              transition: 'all var(--t-med)',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 'var(--r-md)',
                background: method === m.k ? 'var(--terracotta)' : 'var(--ivory)',
                color: method === m.k ? '#fff' : 'var(--charcoal)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{m.name}</div>
                <div className="t-sm" style={{ opacity: 0.7, marginTop: 4 }}>{m.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Invoice section */}
        <div style={{
          marginTop: 24, padding: 24, borderRadius: 'var(--r-lg)',
          background: 'var(--cream)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'var(--ivory)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{Icon.invoice}</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{t.need_invoice}</div>
                <div className="t-sm" style={{ color: 'var(--taupe)', marginTop: 2 }}>
                  {lang === 'es' ? 'Genera tu CFDI automáticamente' : 'Generate your tax receipt automatically'}
                </div>
              </div>
            </div>
            <button onClick={() => setWantsInvoice(!wantsInvoice)} style={{
              width: 52, height: 30, borderRadius: 999,
              background: wantsInvoice ? 'var(--terracotta)' : 'var(--sand)',
              position: 'relative', transition: 'background var(--t-med)',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: wantsInvoice ? 25 : 3,
                width: 24, height: 24, borderRadius: 999, background: '#fff',
                transition: 'left var(--t-med)', boxShadow: 'var(--shadow-xs)',
              }} />
            </button>
          </div>

          {wantsInvoice && (
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <LabeledInput label={t.rfc} value={invoice.rfc} onChange={v => setInvoice({ ...invoice, rfc: v.toUpperCase() })} placeholder="XAXX010101000" mono />
              <LabeledInput label={t.business} value={invoice.business} onChange={v => setInvoice({ ...invoice, business: v })} placeholder="Razón social" />
              <LabeledInput label={t.email} value={invoice.email} onChange={v => setInvoice({ ...invoice, email: v })} placeholder="ana@email.com" style={{ gridColumn: '1 / -1' }} />
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <div className="t-xs" style={{ color: 'var(--taupe)', alignSelf: 'center', marginRight: 4 }}>
                  {lang === 'es' ? 'Uso:' : 'Use:'}
                </div>
                {['G03', 'G01', 'P01'].map(u => (
                  <Chip key={u} size="sm" active={u === 'G03'}>{u} · {u === 'G03' ? (lang === 'es' ? 'Gastos generales' : 'General') : u === 'G01' ? (lang === 'es' ? 'Adquisición' : 'Purchase') : (lang === 'es' ? 'Por definir' : 'TBD')}</Chip>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* live payment phase */}
        <div style={{ marginTop: 20, minHeight: 160 }}>
          {phase === 'cardWait' && <CardTerminal lang={lang} total={total} onDone={() => { setPhase('cardOk'); setTimeout(completeOrder, 900); }} />}
          {phase === 'cashWait' && <CashPad lang={lang} total={total} given={cashGiven} setGiven={setCashGiven} onDone={() => { setPhase('cashOk'); setTimeout(completeOrder, 800); }} />}
          {(phase === 'cardOk' || phase === 'cashOk') && (
            <div style={{
              padding: 24, background: 'var(--success)', color: '#fff',
              borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', gap: 16,
              animation: 'softFade 400ms',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{lang === 'es' ? 'Pago confirmado' : 'Payment confirmed'}</div>
                <div className="t-sm" style={{ opacity: 0.85 }}>{lang === 'es' ? 'Preparando tu pedido…' : 'Preparing your order…'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar summary */}
      <div style={{
        width: 380, flexShrink: 0, padding: 28, background: 'var(--cream)',
        borderLeft: '1px solid var(--mist)',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div className="t-micro" style={{ color: 'var(--taupe)' }}>{lang === 'es' ? 'TU ORDEN' : 'YOUR ORDER'}</div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflow: 'auto',
        }}>
          {cart.map((it, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
              <div>
                <span className="mono" style={{ color: 'var(--taupe)' }}>{it.qty}×</span> {lang === 'es' ? it.name_es : it.name_en}
              </div>
              <div className="mono" style={{ fontWeight: 600 }}>${it.unitPrice * it.qty}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--line)' }} />
        <Row k={t.subtotal} v={`$${subtotal}`} />
        {promoDiscount > 0 && <Row k={t.discount} v={`−$${promoDiscount}`} accent />}
        {redeem > 0 && <Row k={t.points} v={`−$${redeem}`} accent />}
        <div style={{ height: 1, background: 'var(--line)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{t.total}</div>
          <div className="mono" style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em' }}>
            ${total}
          </div>
        </div>
        {user && (
          <div style={{
            padding: '12px 14px', background: 'var(--terracotta-soft)', borderRadius: 'var(--r-sm)',
            fontSize: 12, color: 'var(--terracotta-deep)', fontWeight: 600,
          }}>
            +{Math.round(total / 10)} {lang === 'es' ? 'puntos después del pago' : 'points after payment'}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <div style={{ color: 'var(--taupe)' }}>{k}</div>
      <div className="mono" style={{ fontWeight: 600, color: accent ? 'var(--terracotta)' : 'var(--charcoal)' }}>{v}</div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder, mono, style = {} }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <span className="t-xs" style={{ color: 'var(--taupe)' }}>{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={mono ? 'mono' : ''}
        style={{
          padding: '12px 14px', borderRadius: 'var(--r-sm)',
          border: '1px solid var(--line)', background: 'var(--ivory)',
          fontSize: 14, outline: 'none',
        }} />
    </label>
  );
}

function CardTerminal({ lang, total, onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      padding: 28, borderRadius: 'var(--r-lg)', background: 'var(--charcoal)',
      color: 'var(--ivory)', display: 'flex', alignItems: 'center', gap: 24,
    }}>
      <div style={{ position: 'relative', width: 100, height: 64 }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '2px solid var(--ivory)', borderRadius: 8, opacity: 0.4,
        }} />
        <div style={{
          position: 'absolute', top: 12, left: 12, width: 76, height: 40,
          border: '2px solid var(--terracotta)', borderRadius: 6,
          animation: 'shimmer 1.2s ease-in-out infinite',
        }} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="t-micro" style={{ color: 'var(--terracotta-soft)' }}>{lang === 'es' ? 'ESPERANDO TARJETA' : 'WAITING FOR CARD'}</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 6 }}>
          {lang === 'es' ? 'Inserta o acerca tu tarjeta' : 'Insert or tap your card'}
        </div>
        <div className="t-sm" style={{ opacity: 0.6, marginTop: 4 }}>
          {lang === 'es' ? 'Aceptamos Visa, Mastercard, Amex y contactless' : 'We accept Visa, Mastercard, Amex & contactless'}
        </div>
      </div>
      <div className="mono" style={{ fontSize: 30, fontWeight: 700 }}>${total}</div>
    </div>
  );
}

function CashPad({ lang, total, given, setGiven, onDone }) {
  const denominations = [20, 50, 100, 200, 500, 1000];
  const remaining = Math.max(0, total - given);
  const change = Math.max(0, given - total);

  return (
    <div style={{ padding: 24, borderRadius: 'var(--r-lg)', background: 'var(--cream)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div className="t-micro" style={{ color: 'var(--taupe)' }}>{lang === 'es' ? 'INSERTA BILLETE O MONEDA' : 'INSERT BILL OR COIN'}</div>
          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>
            {given === 0 ? (lang === 'es' ? 'Aún nada recibido' : 'Nothing received yet') :
             remaining > 0 ? (lang === 'es' ? `Faltan $${remaining}` : `$${remaining} remaining`) :
             (lang === 'es' ? `Cambio: $${change}` : `Change: $${change}`)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="t-xs" style={{ color: 'var(--taupe)' }}>{lang === 'es' ? 'RECIBIDO' : 'RECEIVED'}</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700 }}>${given}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {denominations.map(d => (
          <button key={d} onClick={() => setGiven(given + d)} className="mono" style={{
            padding: 14, borderRadius: 'var(--r-md)', background: 'var(--ivory)',
            fontSize: 17, fontWeight: 700, boxShadow: 'var(--shadow-xs)',
          }}>${d}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button onClick={() => setGiven(0)} style={{
          flex: 1, padding: 12, borderRadius: 'var(--r-sm)', background: 'transparent',
          border: '1px solid var(--line)', fontSize: 13, fontWeight: 600, color: 'var(--taupe)',
        }}>{lang === 'es' ? 'Reiniciar' : 'Reset'}</button>
        <button onClick={onDone} disabled={given < total} style={{
          flex: 2, padding: 12, borderRadius: 'var(--r-sm)',
          background: given >= total ? 'var(--charcoal)' : 'var(--sand)',
          color: '#fff', fontSize: 14, fontWeight: 600,
          opacity: given >= total ? 1 : 0.5,
        }}>{lang === 'es' ? 'Confirmar pago' : 'Confirm payment'} →</button>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenPayment });
