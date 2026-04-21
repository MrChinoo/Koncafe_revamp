// Shared atoms: buttons, chips, product placeholder imagery, icons
// Everything reads from CSS variables in tokens.css

// ───────── Product illustration placeholder
// Uses radial gradient ceramic mugs / flat-top compositions.
// kind: 'espresso' | 'latte' | 'matcha' | 'cold' | 'smoothie' | 'toast' | 'pastry' | 'cake'
function ProductArt({ kind = 'latte', size = 200, bg }) {
  const palette = {
    espresso:  { cup: '#E4D6BE', liquid: '#3A2817', rim: '#C9B391', accent: null },
    latte:     { cup: '#EFE6D4', liquid: '#C9A782', rim: '#D9C4A3', foam: '#F6F1E8' },
    matcha:    { cup: '#EFE6D4', liquid: '#7A8B5C', rim: '#D9C4A3', foam: '#C4CFAE' },
    cold:      { cup: 'rgba(195,170,140,0.35)', liquid: '#5C3B22', rim: 'rgba(195,170,140,0.6)', ice: true },
    smoothie:  { cup: 'rgba(217,167,130,0.3)', liquid: '#E8C8A8', rim: 'rgba(217,167,130,0.6)' },
    filter:    { cup: '#EFE6D4', liquid: '#4A2E1A', rim: '#D9C4A3' },
    toast:     { plate: '#EFE6D4', item: '#D9A657', detail: '#8B5A2B' },
    pastry:    { plate: '#EFE6D4', item: '#C9A782', detail: '#8B7355' },
    cake:      { plate: '#EFE6D4', item: '#F6F1E8', detail: '#D97757' },
  };
  const p = palette[kind] || palette.latte;
  const bgColor = bg || 'var(--ivory)';

  return (
    <div style={{
      width: size, height: size, borderRadius: 'var(--r-md)',
      background: bgColor, position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block' }}>
        {/* soft shadow ring */}
        <ellipse cx="100" cy="108" rx="72" ry="70" fill="rgba(42,38,32,0.05)"/>
        {(kind === 'toast' || kind === 'pastry' || kind === 'cake') ? (
          <>
            {/* plate */}
            <circle cx="100" cy="100" r="66" fill={p.plate} stroke="rgba(42,38,32,0.06)" strokeWidth="1"/>
            <circle cx="100" cy="100" r="54" fill="none" stroke="rgba(42,38,32,0.04)" strokeWidth="0.5"/>
            {kind === 'toast' && (
              <>
                <rect x="60" y="72" width="80" height="56" rx="6" fill={p.item}/>
                <rect x="60" y="72" width="80" height="56" rx="6" fill="none" stroke={p.detail} strokeWidth="1.5" strokeOpacity="0.4"/>
                <path d="M70 82 Q 100 94, 130 82 L 130 120 Q 100 108, 70 120 Z" fill={p.detail} fillOpacity="0.25"/>
                <circle cx="85" cy="90" r="1.2" fill={p.detail} fillOpacity="0.6"/>
                <circle cx="115" cy="95" r="1" fill={p.detail} fillOpacity="0.5"/>
                <circle cx="100" cy="110" r="1.2" fill={p.detail} fillOpacity="0.6"/>
              </>
            )}
            {kind === 'pastry' && (
              <>
                <ellipse cx="100" cy="100" rx="40" ry="28" fill={p.item}/>
                <path d="M66 100 Q 100 72, 134 100" fill="none" stroke={p.detail} strokeWidth="1" strokeOpacity="0.45"/>
                <path d="M66 100 Q 100 128, 134 100" fill="none" stroke={p.detail} strokeWidth="1" strokeOpacity="0.45"/>
                <path d="M72 92 L 128 92" stroke={p.detail} strokeWidth="0.8" strokeOpacity="0.3"/>
                <path d="M72 108 L 128 108" stroke={p.detail} strokeWidth="0.8" strokeOpacity="0.3"/>
              </>
            )}
            {kind === 'cake' && (
              <>
                <ellipse cx="100" cy="110" rx="42" ry="18" fill={p.detail} fillOpacity="0.6"/>
                <rect x="58" y="78" width="84" height="32" fill={p.item}/>
                <ellipse cx="100" cy="78" rx="42" ry="12" fill={p.item}/>
                <ellipse cx="100" cy="78" rx="42" ry="12" fill="none" stroke={p.detail} strokeWidth="1" strokeOpacity="0.4"/>
                <circle cx="100" cy="74" r="3" fill={p.detail}/>
              </>
            )}
          </>
        ) : (
          <>
            {/* saucer */}
            <circle cx="100" cy="100" r="66" fill="rgba(42,38,32,0.04)"/>
            {/* cup outer */}
            <circle cx="100" cy="100" r="52" fill={p.cup} stroke="rgba(42,38,32,0.08)" strokeWidth="1"/>
            {/* rim highlight */}
            <circle cx="100" cy="100" r="52" fill="none" stroke={p.rim} strokeWidth="1.5" strokeOpacity="0.55"/>
            {/* liquid */}
            <circle cx="100" cy="100" r="44" fill={p.liquid}/>
            {/* foam swirl / latte art */}
            {kind === 'latte' && (
              <>
                <path d="M 72 100 Q 100 85, 128 100 Q 100 115, 72 100 Z" fill={p.foam} fillOpacity="0.92"/>
                <path d="M 85 100 Q 100 92, 115 100 Q 100 108, 85 100 Z" fill={p.liquid} fillOpacity="0.5"/>
              </>
            )}
            {kind === 'matcha' && (
              <>
                <circle cx="100" cy="100" r="44" fill={p.liquid}/>
                <circle cx="100" cy="100" r="38" fill="none" stroke={p.foam} strokeWidth="1" strokeOpacity="0.35"/>
                <circle cx="88" cy="92" r="4" fill={p.foam} fillOpacity="0.6"/>
                <circle cx="112" cy="108" r="3" fill={p.foam} fillOpacity="0.5"/>
              </>
            )}
            {kind === 'espresso' && (
              <>
                <circle cx="100" cy="100" r="32" fill={p.liquid}/>
                <ellipse cx="94" cy="92" rx="10" ry="4" fill="#C9A782" fillOpacity="0.45"/>
              </>
            )}
            {kind === 'cold' && (
              <>
                <rect x="74" y="78" width="8" height="8" rx="1.5" fill="rgba(246,241,232,0.7)" transform="rotate(18 78 82)"/>
                <rect x="112" y="88" width="10" height="10" rx="1.5" fill="rgba(246,241,232,0.5)" transform="rotate(-12 117 93)"/>
                <rect x="92" y="112" width="7" height="7" rx="1.5" fill="rgba(246,241,232,0.6)" transform="rotate(32 95 115)"/>
              </>
            )}
            {kind === 'smoothie' && (
              <>
                <path d="M 64 100 L 136 100" stroke="#A08763" strokeWidth="0.6" strokeOpacity="0.4"/>
                <circle cx="98" cy="94" r="2" fill="#8B5A2B" fillOpacity="0.7"/>
                <circle cx="108" cy="102" r="1.6" fill="#8B5A2B" fillOpacity="0.6"/>
              </>
            )}
            {kind === 'filter' && (
              <circle cx="100" cy="100" r="44" fill={p.liquid}/>
            )}
          </>
        )}
      </svg>
    </div>
  );
}

// ───────── Button
function Button({ children, kind = 'primary', size = 'md', full, icon, trail, onClick, disabled, style = {} }) {
  const sizes = {
    sm: { h: 36, px: 16, fs: 14, r: 'var(--r-pill)' },
    md: { h: 48, px: 22, fs: 16, r: 'var(--r-pill)' },
    lg: { h: 60, px: 32, fs: 18, r: 'var(--r-pill)' },
    xl: { h: 76, px: 40, fs: 22, r: 'var(--r-pill)' },
  };
  const s = sizes[size];
  const kinds = {
    primary:   { bg: 'var(--charcoal)', fg: 'var(--ivory)', border: 'transparent' },
    accent:    { bg: 'var(--terracotta)', fg: '#fff', border: 'transparent' },
    ghost:     { bg: 'transparent', fg: 'var(--charcoal)', border: 'var(--line)' },
    soft:      { bg: 'var(--cream)', fg: 'var(--charcoal)', border: 'transparent' },
    subtle:    { bg: 'rgba(42,38,32,0.04)', fg: 'var(--charcoal)', border: 'transparent' },
    danger:    { bg: 'var(--danger)', fg: '#fff', border: 'transparent' },
  };
  const k = kinds[kind];
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        height: s.h, padding: `0 ${s.px}px`,
        background: k.bg, color: k.fg,
        border: `1px solid ${k.border}`,
        borderRadius: s.r,
        fontSize: s.fs, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, letterSpacing: '-0.01em',
        width: full ? '100%' : undefined,
        opacity: disabled ? 0.4 : 1,
        transition: 'transform var(--t-fast), box-shadow var(--t-med), background var(--t-med)',
        boxShadow: kind === 'accent' ? 'var(--shadow-warm)' : 'var(--shadow-xs)',
        ...style,
      }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={e => !disabled && (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => !disabled && (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon}
      {children}
      {trail}
    </button>
  );
}

// ───────── Chip (category / filter / selectable option)
function Chip({ children, active, onClick, size = 'md', icon }) {
  const h = size === 'lg' ? 52 : size === 'sm' ? 32 : 40;
  const fs = size === 'lg' ? 17 : size === 'sm' ? 13 : 15;
  const px = size === 'lg' ? 22 : size === 'sm' ? 12 : 16;
  return (
    <button onClick={onClick} style={{
      height: h, padding: `0 ${px}px`,
      borderRadius: 'var(--r-pill)',
      background: active ? 'var(--charcoal)' : 'transparent',
      color: active ? 'var(--ivory)' : 'var(--charcoal)',
      border: `1px solid ${active ? 'var(--charcoal)' : 'var(--line)'}`,
      fontSize: fs, fontWeight: active ? 600 : 500,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      transition: 'all var(--t-fast)',
      whiteSpace: 'nowrap',
    }}>
      {icon}
      {children}
    </button>
  );
}

// ───────── Stepper (qty / shots)
function Stepper({ value, onChange, min = 0, max = 9 }) {
  const btn = (sign) => (
    <button onClick={() => onChange(Math.max(min, Math.min(max, value + sign)))} style={{
      width: 40, height: 40, borderRadius: 'var(--r-pill)',
      background: 'var(--cream)', color: 'var(--charcoal)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, fontWeight: 500,
    }}>{sign > 0 ? '+' : '−'}</button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {btn(-1)}
      <div className="mono" style={{ minWidth: 28, textAlign: 'center', fontSize: 18, fontWeight: 600 }}>{value}</div>
      {btn(+1)}
    </div>
  );
}

// ───────── Korean glyph monogram
function Monogram({ size = 40, bg = 'var(--charcoal)', fg = 'var(--ivory)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 'var(--r-pill)',
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-kr)', fontWeight: 700,
      fontSize: size * 0.42, letterSpacing: '-0.02em',
    }}>콘</div>
  );
}

// ───────── Icons (stroke, 24)
const Icon = {
  plus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  minus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  arrow: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M11 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12l6 6L20 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bag:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 8h14l-1 12H6L5 8z" stroke="currentColor" strokeWidth="1.6"/><path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.9 6 6.6 1-4.8 4.6 1.1 6.6L12 18l-5.8 3.2 1.1-6.6L2.5 10l6.6-1L12 3z" fill="currentColor"/></svg>,
  qr:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14h1v1h-1zM14 20h1v1h-1zM17 17h4v4" strokeLinejoin="round"/></svg>,
  phone: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="6" y="3" width="12" height="18" rx="3"/><path d="M11 18h2"/></svg>,
  card: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>,
  cash: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>,
  invoice: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3h11l3 3v15H5z"/><path d="M16 3v4h4M8 10h8M8 14h8M8 18h5"/></svg>,
  globe: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>,
};

Object.assign(window, { ProductArt, Button, Chip, Stepper, Monogram, Icon });
