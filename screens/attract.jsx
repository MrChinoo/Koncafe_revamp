// Attract / Welcome screen
function ScreenAttract({ t, lang, setLang, onStart }) {
  return (
    <div data-screen-label="01 Attract" style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: 'var(--ivory)',
    }}>
      {/* layered beige background */}
      <div style={{
        position: 'absolute', right: -120, top: -120,
        width: 900, height: 900, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, var(--cream), transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', left: -80, bottom: -200,
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle at 70% 30%, rgba(217,119,87,0.08), transparent 65%)',
      }} />

      {/* top rail */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 72,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 32px',
      }}>
        <div className="t-micro" style={{ color: 'var(--taupe)' }}>Terminal 03 · 09:41</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['es','en'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: '6px 12px', borderRadius: 999,
              background: lang === l ? 'var(--charcoal)' : 'transparent',
              color: lang === l ? 'var(--ivory)' : 'var(--taupe)',
              fontSize: 12, fontWeight: 600,
            }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid', gridTemplateColumns: '1.1fr 1fr', alignItems: 'center',
        padding: '0 80px',
      }}>
        {/* left content */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <Monogram size={56} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
                KONCAFFE
              </div>
              <div className="kr" style={{ color: 'var(--taupe)', fontSize: 14, marginTop: 4, letterSpacing: '0.04em' }}>
                콘카페 · slow coffee, fast service
              </div>
            </div>
          </div>

          <div className="t-display" style={{
            color: 'var(--charcoal)', marginTop: 12,
            fontSize: 128, lineHeight: 0.88, letterSpacing: '-0.045em',
          }}>
            {lang === 'es' ? (<>Una pausa<br/><em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--terracotta)' }}>moderna.</em></>)
                           : (<>A modern<br/><em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--terracotta)' }}>pause.</em></>)}
          </div>

          <div className="t-body-lg" style={{ color: 'var(--taupe)', marginTop: 32, maxWidth: 480, lineHeight: 1.4 }}>
            {lang === 'es'
              ? 'Ordena tu café, matcha o tostada a tu gusto. Acumula puntos con cada visita.'
              : 'Order your coffee, matcha or toast your way. Earn points with every visit.'}
          </div>

          <button onClick={onStart} style={{
            marginTop: 56, padding: '24px 40px 24px 48px',
            background: 'var(--charcoal)', color: 'var(--ivory)',
            borderRadius: 999, fontSize: 22, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 20,
            boxShadow: '0 20px 40px rgba(42,38,32,0.18)',
            animation: 'softFade 600ms var(--t-slow)',
          }}>
            <span>{t.tap_to_start}</span>
            <div style={{
              width: 44, height: 44, borderRadius: 999, background: 'var(--terracotta)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>{Icon.arrow}</div>
          </button>

          <div style={{ display: 'flex', gap: 40, marginTop: 72 }}>
            {[
              { k: lang === 'es' ? 'Bebidas' : 'Drinks',   v: '24' },
              { k: lang === 'es' ? 'Alimentos' : 'Food',   v: '11' },
              { k: lang === 'es' ? 'Orgánico' : 'Organic', v: '100%' },
            ].map(x => (
              <div key={x.k}>
                <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em' }}>{x.v}</div>
                <div className="t-micro" style={{ color: 'var(--taupe)', marginTop: 4 }}>{x.k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* right — hero art */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'relative', width: 440, height: 520 }}>
            {/* stacked large ceramic cups, offset */}
            <div style={{ position: 'absolute', top: 40, left: 40 }}>
              <ProductArt kind="matcha" size={360} bg="transparent" />
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--r-lg)' }}>
              <ProductArt kind="latte" size={240} bg="var(--cream)" />
            </div>
            <div style={{
              position: 'absolute', top: 0, right: 20,
              padding: '14px 18px', background: 'var(--charcoal)', color: 'var(--ivory)',
              borderRadius: 'var(--r-md)', transform: 'rotate(4deg)',
              boxShadow: 'var(--shadow-md)',
            }}>
              <div className="t-micro" style={{ opacity: 0.6 }}>TODAY · 04.20</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>Matcha Yuzu</div>
              <div className="t-xs" style={{ color: 'var(--terracotta-soft)', marginTop: 2 }}>New release</div>
            </div>
          </div>
        </div>
      </div>

      {/* accessibility foot */}
      <div style={{
        position: 'absolute', left: 32, bottom: 24, right: 32,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div className="t-xs" style={{ color: 'var(--taupe)' }}>
          {lang === 'es' ? 'Pantalla accesible · sin gluten disponible' : 'Accessible screen · gluten-free available'}
        </div>
        <div className="t-xs mono" style={{ color: 'var(--taupe)', letterSpacing: '0.14em' }}>
          EST. 2024 · CDMX
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenAttract });
