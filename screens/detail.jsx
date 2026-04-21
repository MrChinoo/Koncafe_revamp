// Product detail / customization screen — two variant styles via `variant` prop
function ScreenDetail({ t, lang, product, onBack, onAdd, variant = 'panel' }) {
  if (!product) return null;
  // Usa customización dinámica de Firestore si existe, fallback a schema por categoría
  const schema = (CUSTOM_FS && CUSTOM_FS[product.id]) || CUSTOM[product.cat] || {};
  const initial = {};
  Object.entries(schema).forEach(([k, v]) => {
    if (v.stepper) { initial[k] = v.def; }
    else if (v.multi) { initial[k] = []; }
    else { initial[k] = (v.options.find(o => o.def) || v.options[0]).k; }
  });
  const [sel, setSel] = React.useState(initial);
  const [qty, setQty] = React.useState(1);
  const [service, setService] = React.useState('for_here');

  // compute delta
  let delta = 0;
  Object.entries(schema).forEach(([k, v]) => {
    if (v.stepper) {
      delta += (sel[k] - v.def) * (v.perUnit || 0);
    } else if (v.multi) {
      (sel[k] || []).forEach(key => {
        const opt = v.options.find(o => o.k === key);
        if (opt && opt.d) delta += opt.d;
      });
    } else {
      const opt = v.options.find(o => o.k === sel[k]);
      if (opt && opt.d) delta += opt.d;
    }
  });
  const unitPrice = product.price + delta;
  const total = unitPrice * qty;

  const handlePick = (key, v) => {
    const field = schema[key];
    if (field.multi) {
      const cur = sel[key] || [];
      const next = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v];
      setSel({ ...sel, [key]: next });
    } else {
      setSel({ ...sel, [key]: v });
    }
  };

  const handleAdd = () => {
    onAdd({
      ...product,
      unitPrice,
      qty,
      customization: sel,
      service,
    });
    onBack();
  };

  const isPanel = variant === 'panel';

  return (
    <div data-screen-label="03 Detail" style={{ height: '100%', display: 'flex', background: 'var(--ivory)' }}>
      {/* LEFT: product hero */}
      <div style={{
        width: isPanel ? '46%' : '50%',
        background: variant === 'stacked' ? 'var(--ivory)' : 'var(--cream)',
        padding: 32, position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <button onClick={onBack} style={{
          alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px 10px 10px', borderRadius: 999, background: 'var(--ivory)',
          fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-xs)',
        }}>
          {Icon.back} <span>{t.back}</span>
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: '10%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217,119,87,0.06), transparent 65%)',
          }} />
          <ProductArt kind={product.art} size={380} bg="transparent" />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="t-micro" style={{ color: 'var(--terracotta)' }}>
                {t.categories[product.cat]}
              </div>
              <div className="kr" style={{ fontSize: 14, color: 'var(--taupe)', marginTop: 8 }}>{product.kr}</div>
              <div className="t-h1" style={{ marginTop: 6, letterSpacing: '-0.035em' }}>
                {lang === 'es' ? product.name_es : product.name_en}
              </div>
              <div className="t-body" style={{ color: 'var(--taupe)', marginTop: 10, maxWidth: 380 }}>
                {lang === 'es' ? product.desc_es : product.desc_en}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="t-micro" style={{ color: 'var(--taupe)' }}>{lang === 'es' ? 'DESDE' : 'FROM'}</div>
              <div className="mono" style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em' }}>
                ${product.price}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: customization */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: variant === 'stacked' ? 'var(--cream)' : 'var(--ivory)',
      }}>
        <div style={{ flex: 1, overflow: 'auto', padding: '32px 36px 24px' }}>
          <div className="t-micro" style={{ color: 'var(--taupe)' }}>{t.custom}</div>
          <div className="t-h3" style={{ marginTop: 4, marginBottom: 20 }}>
            {lang === 'es' ? 'Hazlo tuyo' : 'Make it yours'}
          </div>

          {/* Service type */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[
              { k: 'for_here', label: t.for_here },
              { k: 'to_go', label: t.to_go },
            ].map(s => (
              <button key={s.k} onClick={() => setService(s.k)} style={{
                flex: 1, padding: '14px', borderRadius: 'var(--r-md)',
                background: service === s.k ? 'var(--charcoal)' : 'var(--cream)',
                color: service === s.k ? 'var(--ivory)' : 'var(--charcoal)',
                fontSize: 15, fontWeight: 600,
                border: service === s.k ? 'none' : '1px solid transparent',
              }}>{s.label}</button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {Object.entries(schema).map(([key, field]) => (
              <CustomField
                key={key}
                fieldKey={key}
                field={field}
                value={sel[key]}
                onPick={(v) => handlePick(key, v)}
                onSet={(v) => setSel({ ...sel, [key]: v })}
                lang={lang}
                variant={variant}
              />
            ))}
            {Object.keys(schema).length === 0 && (
              <div style={{
                padding: 20, background: 'var(--cream)', borderRadius: 'var(--r-md)',
                color: 'var(--taupe)', fontSize: 14,
              }}>
                {lang === 'es' ? 'Este producto no se personaliza.' : 'This item is served as-is.'}
              </div>
            )}
          </div>
        </div>

        {/* Footer bar */}
        <div style={{
          padding: '20px 36px', borderTop: '1px solid var(--mist)',
          display: 'flex', alignItems: 'center', gap: 20, background: 'var(--ivory)',
        }}>
          <div>
            <div className="t-xs" style={{ color: 'var(--taupe)' }}>{lang === 'es' ? 'Cantidad' : 'Quantity'}</div>
            <div style={{ marginTop: 6 }}><Stepper value={qty} onChange={setQty} min={1} max={9} /></div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right' }}>
            <div className="t-xs" style={{ color: 'var(--taupe)' }}>Total</div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
              ${total}
            </div>
          </div>
          <button onClick={handleAdd} style={{
            padding: '18px 28px', borderRadius: 'var(--r-pill)',
            background: 'var(--charcoal)', color: 'var(--ivory)',
            display: 'flex', alignItems: 'center', gap: 12,
            fontSize: 16, fontWeight: 600,
            boxShadow: 'var(--shadow-md)',
          }}>
            <span>{t.add_to_order}</span>
            <div style={{
              width: 32, height: 32, borderRadius: 999, background: 'var(--terracotta)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icon.arrow}</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomField({ fieldKey, field, value, onPick, onSet, lang, variant }) {
  const label = lang === 'es' ? field.label_es : field.label_en;

  if (field.stepper) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{label}</div>
          <div className="t-xs" style={{ color: 'var(--taupe)' }}>
            +${field.perUnit} {lang === 'es' ? 'c/u' : 'each'}
          </div>
        </div>
        <div style={{
          padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'var(--cream)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div className="mono" style={{ fontSize: 15 }}>{value} {lang === 'es' ? 'shots' : 'shots'}</div>
          <Stepper value={value} onChange={onSet} min={field.min} max={field.max} />
        </div>
      </div>
    );
  }

  const isChips = variant === 'panel';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{label}</div>
        {field.multi && (
          <div className="t-xs" style={{ color: 'var(--taupe)' }}>
            {lang === 'es' ? 'Elige los que quieras' : 'Choose any'}
          </div>
        )}
      </div>
      <div style={{
        display: isChips ? 'flex' : 'grid',
        gridTemplateColumns: isChips ? undefined : 'repeat(auto-fill, minmax(120px, 1fr))',
        flexWrap: isChips ? 'wrap' : undefined,
        gap: 8,
      }}>
        {field.options.map(opt => {
          const active = field.multi ? (value || []).includes(opt.k) : value === opt.k;
          const optLabel = opt.label_es ? (lang === 'es' ? opt.label_es : opt.label_en) : opt.k;
          if (isChips) {
            return (
              <button key={opt.k} onClick={() => onPick(opt.k)} style={{
                padding: '12px 16px', borderRadius: 'var(--r-pill)',
                background: active ? 'var(--charcoal)' : 'var(--cream)',
                color: active ? 'var(--ivory)' : 'var(--charcoal)',
                fontSize: 14, fontWeight: active ? 600 : 500,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: 'none',
              }}>
                <span>{optLabel}</span>
                {opt.sub && <span style={{ opacity: 0.6, fontSize: 12 }}>{opt.sub}</span>}
                {opt.d ? <span style={{ opacity: 0.7, fontSize: 12 }}>· ${opt.d > 0 ? '+' : ''}{opt.d}</span> : null}
              </button>
            );
          }
          // card variant
          return (
            <button key={opt.k} onClick={() => onPick(opt.k)} style={{
              padding: '14px 12px', borderRadius: 'var(--r-md)',
              background: active ? 'var(--charcoal)' : 'var(--cream)',
              color: active ? 'var(--ivory)' : 'var(--charcoal)',
              display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center',
              border: active ? '2px solid var(--terracotta)' : '2px solid transparent',
              minHeight: 72,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{optLabel}</div>
              {opt.sub && <div className="t-xs" style={{ opacity: 0.7 }}>{opt.sub}</div>}
              {opt.d ? <div className="t-xs" style={{ opacity: 0.7 }}>${opt.d > 0 ? '+' : ''}{opt.d}</div> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenDetail });
