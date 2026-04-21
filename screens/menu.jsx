// Menu browse screen — supports 3 layout variants via props.layout: 'cards' | 'list' | 'editorial'
function ScreenMenu({ t, lang, cart, onAdd, onOpen, layout = 'cards' }) {
  const [cat, setCat] = React.useState('espresso');
  const cats = ['espresso','filter','matcha','cold','smoothie','toast','pastry','cake'];
  const items = MENU.filter(m => m.cat === cat);

  const curated = MENU.filter(m => m.tag === 'popular').slice(0, 4);

  return (
    <div data-screen-label="02 Menu" style={{ display: 'flex', height: '100%', background: 'var(--ivory)' }}>
      {/* side rail — categories */}
      <div style={{
        width: 200, flexShrink: 0, padding: '24px 16px 24px 20px',
        borderRight: '1px solid var(--mist)', background: 'var(--ivory)',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div className="t-micro" style={{ color: 'var(--taupe)', padding: '0 12px 12px' }}>
          {lang === 'es' ? 'CATEGORÍAS' : 'CATEGORIES'}
        </div>
        {cats.map(c => {
          const active = c === cat;
          return (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '12px 14px', borderRadius: 'var(--r-md)',
              background: active ? 'var(--charcoal)' : 'transparent',
              color: active ? 'var(--ivory)' : 'var(--charcoal)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 15, fontWeight: active ? 600 : 500,
              transition: 'all var(--t-fast)',
            }}>
              <span>{t.categories[c]}</span>
              <span className="mono" style={{
                fontSize: 11, opacity: active ? 0.7 : 0.4,
              }}>{String(MENU.filter(m=>m.cat===c).length).padStart(2,'0')}</span>
            </button>
          );
        })}

        <div style={{ flex: 1 }} />
        <div style={{
          padding: 14, borderRadius: 'var(--r-md)', background: 'var(--cream)',
          fontSize: 12, color: 'var(--taupe)', lineHeight: 1.45,
        }}>
          <div className="t-micro" style={{ color: 'var(--terracotta)' }}>TIP</div>
          <div style={{ marginTop: 6 }}>
            {lang === 'es' ? 'Personaliza cualquier bebida: tamaño, leche, shots y dulzor.' : 'Customize any drink: size, milk, shots and sweetness.'}
          </div>
        </div>
      </div>

      {/* main */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px 120px' }}>
        {/* category header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div className="t-micro" style={{ color: 'var(--taupe)' }}>
              {t.categories[cat]} · {items.length} {lang === 'es' ? 'opciones' : 'options'}
            </div>
            <h1 className="t-h1" style={{ margin: '6px 0 0', color: 'var(--charcoal)' }}>
              {cat === 'espresso' && (lang === 'es' ? 'Espresso' : 'Espresso')}
              {cat === 'filter' && (lang === 'es' ? 'Café filtrado' : 'Filter coffee')}
              {cat === 'matcha' && (lang === 'es' ? 'Matcha & Té' : 'Matcha & Tea')}
              {cat === 'cold' && (lang === 'es' ? 'Especiales fríos' : 'Cold specials')}
              {cat === 'smoothie' && 'Smoothies'}
              {cat === 'toast' && (lang === 'es' ? 'Tostadas' : 'Toast')}
              {cat === 'pastry' && (lang === 'es' ? 'Pastelería' : 'Pastry')}
              {cat === 'cake' && (lang === 'es' ? 'Postres' : 'Desserts')}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip active size="sm">{lang === 'es' ? 'Todo' : 'All'}</Chip>
            <Chip size="sm">{lang === 'es' ? 'Más pedido' : 'Most ordered'}</Chip>
            <Chip size="sm">{lang === 'es' ? 'Nuevo' : 'New'}</Chip>
            <Chip size="sm">{lang === 'es' ? 'Sin lactosa' : 'Dairy-free'}</Chip>
          </div>
        </div>

        {/* LAYOUT VARIANTS */}
        {layout === 'cards' && <GridCards items={items} lang={lang} t={t} onOpen={onOpen} onAdd={onAdd} />}
        {layout === 'list' && <ListRows items={items} lang={lang} t={t} onOpen={onOpen} onAdd={onAdd} />}
        {layout === 'editorial' && <Editorial items={items} lang={lang} t={t} onOpen={onOpen} onAdd={onAdd} />}

        {/* upsell rail */}
        <div style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <div className="t-micro" style={{ color: 'var(--terracotta)' }}>{lang === 'es' ? 'COMBINA BIEN' : 'PAIRS WELL'}</div>
              <div className="t-h4" style={{ marginTop: 4 }}>{lang === 'es' ? 'Completa tu pedido' : 'Complete your order'}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {curated.map(p => (
              <button key={p.id} onClick={() => onOpen(p)} style={{
                padding: 14, borderRadius: 'var(--r-md)', background: 'var(--cream)',
                display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
              }}>
                <ProductArt kind={p.art} size={64} bg="var(--ivory)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{lang === 'es' ? p.name_es : p.name_en}</div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--terracotta)', marginTop: 4 }}>${p.price}</div>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 999, background: 'var(--charcoal)', color: 'var(--ivory)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{Icon.plus}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ───── Variant A: Cards grid (default)
function GridCards({ items, lang, t, onOpen, onAdd }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
      {items.map(p => (
        <button key={p.id} onClick={() => onOpen(p)} style={{
          background: 'var(--cream)', borderRadius: 'var(--r-lg)',
          padding: 20, textAlign: 'left', position: 'relative',
          transition: 'transform var(--t-fast), box-shadow var(--t-med)',
          boxShadow: 'var(--shadow-xs)',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
        >
          {p.tag && (
            <div style={{
              position: 'absolute', top: 16, right: 16,
              padding: '4px 10px', borderRadius: 999,
              background: p.tag === 'new' ? 'var(--terracotta)' : 'var(--ivory)',
              color: p.tag === 'new' ? '#fff' : 'var(--charcoal)',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              border: p.tag !== 'new' ? '1px solid var(--line)' : 'none',
            }}>{p.tag === 'new' ? (lang === 'es' ? 'NUEVO' : 'NEW') : p.tag === 'popular' ? '★' : '♦'}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 20px' }}>
            <ProductArt kind={p.art} size={160} bg="transparent" />
          </div>
          <div className="kr" style={{ fontSize: 12, color: 'var(--taupe)', letterSpacing: '0.05em' }}>{p.kr}</div>
          <div style={{ fontSize: 19, fontWeight: 600, marginTop: 6, letterSpacing: '-0.015em' }}>
            {lang === 'es' ? p.name_es : p.name_en}
          </div>
          <div style={{ fontSize: 13, color: 'var(--taupe)', marginTop: 4, minHeight: 18 }}>
            {lang === 'es' ? p.desc_es : p.desc_en}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>${p.price}</div>
            <div style={{
              width: 40, height: 40, borderRadius: 999, background: 'var(--charcoal)', color: 'var(--ivory)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icon.plus}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ───── Variant B: List rows
function ListRows({ items, lang, t, onOpen }) {
  return (
    <div style={{ background: 'var(--cream)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      {items.map((p, i) => (
        <button key={p.id} onClick={() => onOpen(p)} style={{
          display: 'flex', alignItems: 'center', gap: 20,
          padding: '20px 24px', width: '100%', textAlign: 'left',
          borderBottom: i < items.length - 1 ? '1px solid rgba(42,38,32,0.05)' : 'none',
        }}>
          <ProductArt kind={p.art} size={80} bg="var(--ivory)" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
              <div style={{ fontSize: 19, fontWeight: 600 }}>{lang === 'es' ? p.name_es : p.name_en}</div>
              <div className="kr" style={{ fontSize: 12, color: 'var(--taupe)' }}>{p.kr}</div>
              {p.tag === 'new' && (
                <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--terracotta)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
                  {lang === 'es' ? 'NUEVO' : 'NEW'}
                </span>
              )}
            </div>
            <div style={{ fontSize: 14, color: 'var(--taupe)', marginTop: 4 }}>{lang === 'es' ? p.desc_es : p.desc_en}</div>
          </div>
          <div className="mono" style={{ fontSize: 17, fontWeight: 700, width: 60, textAlign: 'right' }}>${p.price}</div>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--charcoal)', color: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.plus}
          </div>
        </button>
      ))}
    </div>
  );
}

// ───── Variant C: Editorial — asymmetric magazine-style
function Editorial({ items, lang, t, onOpen }) {
  const [feat, ...rest] = items;
  if (!feat) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
      <button onClick={() => onOpen(feat)} style={{
        background: 'var(--cream)', borderRadius: 'var(--r-xl)',
        padding: 32, textAlign: 'left', position: 'relative', minHeight: 440,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div className="t-micro" style={{ color: 'var(--terracotta)' }}>
              {feat.tag === 'new' ? (lang === 'es' ? 'NUEVO' : 'NEW') : (lang === 'es' ? 'DESTACADO' : 'FEATURED')}
            </div>
            <div className="kr" style={{ fontSize: 14, color: 'var(--taupe)', marginTop: 8 }}>{feat.kr}</div>
            <div className="t-h2" style={{ marginTop: 8, maxWidth: 360 }}>{lang === 'es' ? feat.name_es : feat.name_en}</div>
            <div className="t-body" style={{ color: 'var(--taupe)', marginTop: 12, maxWidth: 320 }}>
              {lang === 'es' ? feat.desc_es : feat.desc_en}
            </div>
          </div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700 }}>${feat.price}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <ProductArt kind={feat.art} size={260} bg="transparent" />
        </div>
      </button>
      <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: 12 }}>
        {rest.slice(0, 3).map(p => (
          <button key={p.id} onClick={() => onOpen(p)} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '16px 20px', background: 'var(--cream)', borderRadius: 'var(--r-md)', textAlign: 'left',
          }}>
            <ProductArt kind={p.art} size={72} bg="var(--ivory)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{lang === 'es' ? p.name_es : p.name_en}</div>
              <div className="t-xs" style={{ color: 'var(--taupe)', marginTop: 4 }}>{lang === 'es' ? p.desc_es : p.desc_en}</div>
            </div>
            <div className="mono" style={{ fontSize: 15, fontWeight: 700 }}>${p.price}</div>
          </button>
        ))}
        {rest.length > 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {rest.slice(3, 5).map(p => (
              <button key={p.id} onClick={() => onOpen(p)} style={{
                padding: 16, background: 'var(--cream)', borderRadius: 'var(--r-md)',
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <ProductArt kind={p.art} size={56} bg="var(--ivory)" />
                <div style={{ fontSize: 14, fontWeight: 600 }}>{lang === 'es' ? p.name_es : p.name_en}</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>${p.price}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenMenu });
