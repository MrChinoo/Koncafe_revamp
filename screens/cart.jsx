// Cart review screen
function ScreenCart({ t, lang, cart, setCart, user, onBack, onNext, promo, setPromo }) {
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const [code, setCode] = React.useState(promo || '');
  const [applied, setApplied] = React.useState(!!promo);
  const [redeem, setRedeem] = React.useState(0);

  const promoDiscount = applied ? Math.round(subtotal * 0.15) : 0;
  const pointsDiscount = redeem;
  const discount = promoDiscount + pointsDiscount;
  const total = Math.max(0, subtotal - discount);
  const earned = Math.round(total / 10);

  const removeItem = (idx) => setCart(cart.filter((_, i) => i !== idx));
  const setQty = (idx, q) => setCart(cart.map((it, i) => i === idx ? { ...it, qty: Math.max(1, q) } : it));

  const describeCustom = (it) => {
    if (!it.customization) return '';
    const schema = CUSTOM[it.cat] || {};
    const parts = [];
    if (it.customization.size) parts.push(it.customization.size);
    if (it.customization.temperature) parts.push(it.customization.temperature === 'hot' ? (lang === 'es' ? 'Caliente' : 'Hot') : (lang === 'es' ? 'Frío' : 'Iced'));
    if (it.customization.milk) {
      const opt = (schema.milk?.options || []).find(o => o.k === it.customization.milk);
      if (opt) parts.push(lang === 'es' ? opt.label_es : opt.label_en);
    }
    if (it.customization.shots) parts.push(`${it.customization.shots} shots`);
    if (it.customization.sweetness) parts.push(`${lang === 'es' ? 'Dulzor' : 'Sweet'} ${it.customization.sweetness}%`);
    if (Array.isArray(it.customization.extras) && it.customization.extras.length) {
      it.customization.extras.forEach(k => {
        const opt = (schema.extras?.options || []).find(o => o.k === k);
        if (opt) parts.push('+' + (lang === 'es' ? opt.label_es : opt.label_en));
      });
    }
    return parts.join(' · ');
  };

  return (
    <div data-screen-label="04 Cart" style={{ height: '100%', display: 'flex', background: 'var(--ivory)' }}>
      <div style={{ flex: 1, padding: '28px 40px', overflow: 'auto' }}>
        <button onClick={onBack} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 14px 10px 10px', borderRadius: 999, background: 'var(--cream)',
          fontSize: 14, fontWeight: 600, marginBottom: 20, whiteSpace: 'nowrap',
        }}>{Icon.back} <span>{lang === 'es' ? 'Seguir pidiendo' : 'Keep ordering'}</span></button>

        <div className="t-micro" style={{ color: 'var(--taupe)' }}>{t.cart}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <h1 className="t-h1" style={{ margin: '4px 0 32px' }}>
            {cart.reduce((s, i) => s + i.qty, 0)} <span style={{ color: 'var(--taupe)', fontWeight: 500 }}>
              {lang === 'es' ? (cart.length === 1 ? 'artículo' : 'artículos') : (cart.length === 1 ? 'item' : 'items')}
            </span>
          </h1>
        </div>

        {cart.length === 0 && (
          <div style={{
            marginTop: 40, padding: 60, textAlign: 'center',
            background: 'var(--cream)', borderRadius: 'var(--r-lg)', color: 'var(--taupe)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>◯</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--charcoal)' }}>{t.empty_cart}</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cart.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 20,
              padding: 18, background: 'var(--cream)', borderRadius: 'var(--r-lg)',
            }}>
              <ProductArt kind={it.art} size={80} bg="var(--ivory)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{lang === 'es' ? it.name_es : it.name_en}</div>
                  {it.service && (
                    <span className="t-xs" style={{
                      padding: '2px 8px', borderRadius: 999, background: 'var(--ivory)',
                      color: 'var(--taupe)', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {it.service === 'for_here' ? t.for_here : t.to_go}
                    </span>
                  )}
                </div>
                <div className="t-sm" style={{ color: 'var(--taupe)', marginTop: 4 }}>{describeCustom(it)}</div>
              </div>
              <Stepper value={it.qty} onChange={(q) => setQty(i, q)} min={1} max={9} />
              <div className="mono" style={{ fontSize: 17, fontWeight: 700, width: 80, textAlign: 'right' }}>
                ${it.unitPrice * it.qty}
              </div>
              <button onClick={() => removeItem(i)} style={{
                width: 36, height: 36, borderRadius: 999, background: 'var(--ivory)',
                color: 'var(--taupe)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{Icon.close}</button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT sidebar: totals + promo + loyalty */}
      <div style={{
        width: 420, flexShrink: 0, padding: 28, background: 'var(--cream)',
        borderLeft: '1px solid var(--mist)',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div className="t-h4">{lang === 'es' ? 'Resumen' : 'Summary'}</div>

        {/* Promo */}
        <div style={{ padding: 16, background: 'var(--ivory)', borderRadius: 'var(--r-md)' }}>
          <div className="t-xs" style={{ color: 'var(--taupe)' }}>{t.promo}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setApplied(false); }}
              placeholder="KONCAFFE15"
              className="mono"
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 'var(--r-sm)',
                border: '1px solid var(--line)', background: 'var(--ivory)',
                fontSize: 14, letterSpacing: '0.05em', outline: 'none',
              }}
            />
            <button onClick={() => { setApplied(!!code); setPromo(code); }} style={{
              padding: '0 16px', borderRadius: 'var(--r-sm)',
              background: applied ? 'var(--success)' : 'var(--charcoal)', color: '#fff',
              fontSize: 13, fontWeight: 600,
            }}>{applied ? (lang === 'es' ? 'Aplicado' : 'Applied') : t.apply}</button>
          </div>
        </div>

        {/* Redeem loyalty points */}
        {user && user.points > 0 && (
          <div style={{ padding: 16, background: 'var(--ivory)', borderRadius: 'var(--r-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="t-xs" style={{ color: 'var(--taupe)' }}>{t.redeem_points}</div>
              <div className="t-xs mono" style={{ color: 'var(--taupe)' }}>
                {user.points} {t.available}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[0, 20, 50, Math.min(100, user.points)].map(p => (
                <button key={p} onClick={() => setRedeem(p)} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 'var(--r-sm)',
                  background: redeem === p ? 'var(--terracotta)' : 'var(--cream)',
                  color: redeem === p ? '#fff' : 'var(--charcoal)',
                  fontSize: 13, fontWeight: 600,
                }}>{p === 0 ? (lang === 'es' ? 'No' : 'None') : `-$${p}`}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row k={t.subtotal} v={`$${subtotal}`} />
          {promoDiscount > 0 && <Row k={`${t.discount} (KONCAFFE15)`} v={`−$${promoDiscount}`} accent />}
          {pointsDiscount > 0 && <Row k={`${t.points} · ${pointsDiscount} pts`} v={`−$${pointsDiscount}`} accent />}
          <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{t.total}</div>
            <div className="mono" style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em' }}>
              ${total}
            </div>
          </div>
          {user && (
            <div style={{
              padding: '10px 14px', background: 'var(--terracotta-soft)', borderRadius: 'var(--r-sm)',
              fontSize: 13, color: 'var(--terracotta-deep)', fontWeight: 600,
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{lang === 'es' ? 'Ganarás' : 'You will earn'}</span>
              <span>+{earned} {lang === 'es' ? 'puntos' : 'points'}</span>
            </div>
          )}
        </div>

        <button onClick={onNext} disabled={cart.length === 0} style={{
          padding: '22px', borderRadius: 'var(--r-pill)',
          background: cart.length === 0 ? 'var(--sand)' : 'var(--charcoal)',
          color: 'var(--ivory)', fontSize: 17, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          opacity: cart.length === 0 ? 0.5 : 1,
        }}>
          <span>{t.continue}</span>
          <div style={{
            width: 32, height: 32, borderRadius: 999, background: 'var(--terracotta)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icon.arrow}</div>
        </button>
      </div>
    </div>
  );
}

function Row({ k, v, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
      <div style={{ color: 'var(--taupe)' }}>{k}</div>
      <div className="mono" style={{ fontWeight: 600, color: accent ? 'var(--terracotta)' : 'var(--charcoal)' }}>{v}</div>
    </div>
  );
}

Object.assign(window, { ScreenCart });
