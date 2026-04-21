// Loyalty login + reveal moment. `reveal` variant: 'card' | 'scanner' | 'burst'
function ScreenLoyalty({ t, lang, onSignIn, onSkip, user, reveal = 'card' }) {
  const [mode, setMode] = React.useState('choose'); // choose | phone | qr | google | success
  const [phone, setPhone] = React.useState('');
  const [successData, setSuccessData] = React.useState(null);
  const [authError, setAuthError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Si ya hay usuario logueado, mostrar reveal directo
  React.useEffect(() => {
    if (user && user.uid) {
      setSuccessData(user);
      setMode('success');
      const t = setTimeout(() => onSignIn(user), 2200);
      return () => clearTimeout(t);
    }
  }, []);

  async function signInWithGoogle() {
    setLoading(true);
    setAuthError('');
    try {
      const result = await auth.signInWithPopup(googleProvider);
      const fbUser = result.user;
      const userData = await getOrCreateUser(fbUser);
      const appUser = {
        uid: fbUser.uid,
        name: fbUser.displayName || userData.name || 'Usuario',
        initial: (fbUser.displayName || userData.name || 'U')[0].toUpperCase(),
        points: userData.points || 0,
        tier: userData.tier || 'verde',
        email: fbUser.email,
      };
      setSuccessData(appUser);
      setMode('success');
      setTimeout(() => onSignIn(appUser), 2200);
    } catch (err) {
      console.error('Google auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('');
      } else {
        setAuthError(lang === 'es' ? 'Error al iniciar sesión. Intenta de nuevo.' : 'Sign-in error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  // Phone: busca en Firestore por campo (número demo → crea usuario temporal)
  async function finishWithPhone() {
    setLoading(true);
    try {
      // Buscar usuario por teléfono en Firestore
      const snap = await db.collection('users').where('phone', '==', phone).limit(1).get();
      let appUser;
      if (!snap.empty) {
        const userData = snap.docs[0].data();
        appUser = {
          uid: snap.docs[0].id,
          name: userData.name || 'Usuario',
          initial: (userData.name || 'U')[0].toUpperCase(),
          points: userData.points || 0,
          tier: userData.tier || 'verde',
        };
      } else {
        // Usuario no encontrado — crear guest con puntos en cero
        appUser = {
          uid: `phone-${phone}`,
          name: lang === 'es' ? 'Cliente' : 'Customer',
          initial: 'C',
          points: 0,
          tier: 'verde',
        };
      }
      setSuccessData(appUser);
      setMode('success');
      setTimeout(() => onSignIn(appUser), 2200);
    } catch (err) {
      console.error('Phone lookup error:', err);
      // Fallback: continuar como invitado numerado
      const appUser = {
        uid: `phone-${phone}`,
        name: lang === 'es' ? 'Cliente' : 'Customer',
        initial: 'C',
        points: 0,
        tier: 'verde',
      };
      setSuccessData(appUser);
      setMode('success');
      setTimeout(() => onSignIn(appUser), 2200);
    } finally {
      setLoading(false);
    }
  }

  function finishQR() {
    signInWithGoogle();
  }

  return (
    <div data-screen-label="05 Loyalty" style={{ height: '100%', display: 'flex', background: 'var(--ivory)' }}>
      <div style={{ flex: 1, padding: 40, display: 'flex', flexDirection: 'column' }}>
        <div className="t-micro" style={{ color: 'var(--terracotta)' }}>KONCAFFE CLUB · 콘카페 클럽</div>
        <h1 className="t-h1" style={{ marginTop: 10, maxWidth: 520, letterSpacing: '-0.035em' }}>
          {lang === 'es' ? (<>Acumula con <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--terracotta)' }}>cada visita.</em></>)
                         : (<>Earn with <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--terracotta)' }}>every visit.</em></>)}
        </h1>
        <div className="t-body-lg" style={{ color: 'var(--taupe)', marginTop: 20, maxWidth: 460 }}>
          {t.loyalty_sub}. {lang === 'es' ? '1 punto = $1 de descuento.' : '1 point = $1 off.'}
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 40, flexWrap: 'wrap' }}>
          {[
            { k: lang === 'es' ? '1 punto' : '1 point', v: lang === 'es' ? 'por cada $10 gastados' : 'per $10 spent' },
            { k: lang === 'es' ? 'Bebida gratis' : 'Free drink',  v: lang === 'es' ? 'en tu cumpleaños' : 'on your birthday' },
            { k: lang === 'es' ? 'Early access' : 'Early access', v: lang === 'es' ? 'a lanzamientos' : 'to launches' },
          ].map(x => (
            <div key={x.k} style={{
              padding: 20, background: 'var(--cream)', borderRadius: 'var(--r-md)', minWidth: 180,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{x.k}</div>
              <div className="t-sm" style={{ color: 'var(--taupe)', marginTop: 6 }}>{x.v}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button onClick={onSkip} style={{
          alignSelf: 'flex-start', padding: '14px 22px', borderRadius: 999,
          background: 'transparent', border: '1px solid var(--line)',
          fontSize: 15, fontWeight: 500, color: 'var(--taupe)',
        }}>{t.skip} →</button>
      </div>

      {/* RIGHT: interaction panel */}
      <div style={{
        width: 560, flexShrink: 0, background: 'var(--cream)',
        padding: 40, display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>
        {mode === 'choose' && (
          <>
            <div className="t-micro" style={{ color: 'var(--taupe)' }}>{t.loyalty_prompt}</div>
            <div className="t-h3" style={{ marginTop: 8 }}>
              {lang === 'es' ? 'Identifícate' : 'Sign in'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>

              {/* Google Sign-In — método principal */}
              <button onClick={signInWithGoogle} disabled={loading} style={{
                padding: 24, borderRadius: 'var(--r-lg)', background: 'var(--ivory)',
                display: 'flex', alignItems: 'center', gap: 20, textAlign: 'left',
                boxShadow: 'var(--shadow-xs)',
                opacity: loading ? 0.6 : 1,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--r-md)', background: '#fff',
                  border: '1.5px solid #e0e0e0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {/* Google logo SVG */}
                  <svg width="28" height="28" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>
                    {loading ? (lang === 'es' ? 'Iniciando…' : 'Signing in…') : (lang === 'es' ? 'Continuar con Google' : 'Continue with Google')}
                  </div>
                  <div className="t-sm" style={{ color: 'var(--taupe)', marginTop: 4 }}>
                    {lang === 'es' ? 'Rápido y seguro' : 'Fast and secure'}
                  </div>
                </div>
                {Icon.arrow}
              </button>

              <button onClick={() => setMode('qr')} style={{
                padding: 24, borderRadius: 'var(--r-lg)', background: 'var(--ivory)',
                display: 'flex', alignItems: 'center', gap: 20, textAlign: 'left',
                boxShadow: 'var(--shadow-xs)',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--r-md)', background: 'var(--charcoal)',
                  color: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{Icon.qr}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>{t.scan_qr}</div>
                  <div className="t-sm" style={{ color: 'var(--taupe)', marginTop: 4 }}>
                    {lang === 'es' ? 'Desde tu app móvil' : 'From your mobile app'}
                  </div>
                </div>
                {Icon.arrow}
              </button>

              <button onClick={() => setMode('phone')} style={{
                padding: 24, borderRadius: 'var(--r-lg)', background: 'var(--ivory)',
                display: 'flex', alignItems: 'center', gap: 20, textAlign: 'left',
                boxShadow: 'var(--shadow-xs)',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--r-md)', background: 'var(--terracotta)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{Icon.phone}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>{t.enter_phone}</div>
                  <div className="t-sm" style={{ color: 'var(--taupe)', marginTop: 4 }}>
                    {lang === 'es' ? 'O regístrate en segundos' : 'Or register in seconds'}
                  </div>
                </div>
                {Icon.arrow}
              </button>
            </div>

            {authError && (
              <div style={{
                marginTop: 16, padding: '12px 16px', borderRadius: 'var(--r-sm)',
                background: 'rgba(184,95,66,0.1)', color: 'var(--terracotta-deep)',
                fontSize: 14, fontWeight: 500,
              }}>{authError}</div>
            )}
          </>
        )}

        {mode === 'phone' && (
          <PhonePad phone={phone} setPhone={setPhone} lang={lang}
            onBack={() => setMode('choose')} onSubmit={finishWithPhone} loading={loading} />
        )}

        {mode === 'qr' && <QRScanner lang={lang} onBack={() => setMode('choose')} onDetect={finishQR} />}

        {mode === 'success' && successData && (
          <LoyaltyReveal data={successData} lang={lang} variant={reveal} />
        )}
      </div>
    </div>
  );
}

function PhonePad({ phone, setPhone, onBack, onSubmit, lang, loading }) {
  const press = (d) => setPhone((phone + d).slice(0, 10));
  const del = () => setPhone(phone.slice(0, -1));
  const formatted = phone.length > 0 ? phone.replace(/(\d{3})(\d{0,3})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' ')) : '';

  return (
    <>
      <button onClick={onBack} style={{
        alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px 8px 10px', borderRadius: 999, background: 'var(--ivory)',
        fontSize: 14, fontWeight: 600, marginBottom: 20,
      }}>{Icon.back} <span>{lang === 'es' ? 'Atrás' : 'Back'}</span></button>

      <div className="t-micro" style={{ color: 'var(--taupe)' }}>
        {lang === 'es' ? 'Tu número' : 'Your number'}
      </div>
      <div className="mono" style={{
        fontSize: 38, fontWeight: 700, letterSpacing: '-0.01em',
        minHeight: 48, marginTop: 8, color: phone ? 'var(--charcoal)' : 'var(--line)',
      }}>
        {formatted || '000 000 0000'}
      </div>

      <div style={{
        marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, flex: 1,
      }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => press(String(n))} className="mono" style={{
            background: 'var(--ivory)', borderRadius: 'var(--r-md)',
            fontSize: 28, fontWeight: 500, letterSpacing: '-0.01em',
            boxShadow: 'var(--shadow-xs)',
          }}>{n}</button>
        ))}
        <button onClick={onBack} style={{
          background: 'transparent', fontSize: 13, color: 'var(--taupe)', fontWeight: 500,
        }}>{lang === 'es' ? 'Cancelar' : 'Cancel'}</button>
        <button onClick={() => press('0')} className="mono" style={{
          background: 'var(--ivory)', borderRadius: 'var(--r-md)',
          fontSize: 28, fontWeight: 500,
          boxShadow: 'var(--shadow-xs)',
        }}>0</button>
        <button onClick={del} style={{
          background: 'transparent', fontSize: 16, color: 'var(--taupe)', fontWeight: 500,
        }}>⌫</button>
      </div>

      <button onClick={onSubmit} disabled={phone.length < 10 || loading} style={{
        marginTop: 16, padding: 20, borderRadius: 'var(--r-pill)',
        background: phone.length < 10 || loading ? 'var(--sand)' : 'var(--charcoal)',
        color: 'var(--ivory)', fontSize: 16, fontWeight: 600,
        opacity: phone.length < 10 || loading ? 0.5 : 1,
      }}>{loading ? (lang === 'es' ? 'Buscando…' : 'Looking up…') : (lang === 'es' ? 'Continuar' : 'Continue')} →</button>
    </>
  );
}

function QRScanner({ onBack, onDetect, lang }) {
  React.useEffect(() => {
    const t = setTimeout(onDetect, 2400);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <button onClick={onBack} style={{
        alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px 8px 10px', borderRadius: 999, background: 'var(--ivory)',
        fontSize: 14, fontWeight: 600, marginBottom: 20,
      }}>{Icon.back} <span>{lang === 'es' ? 'Atrás' : 'Back'}</span></button>

      <div className="t-h3">{lang === 'es' ? 'Acerca tu código' : 'Hold your code'}</div>
      <div className="t-sm" style={{ color: 'var(--taupe)', marginTop: 6 }}>
        {lang === 'es' ? 'Inicia sesión con Google automáticamente' : 'Signs you in with Google automatically'}
      </div>

      <div style={{
        flex: 1, marginTop: 24, borderRadius: 'var(--r-lg)',
        background: '#1a1612', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {[
          { top: 24, left: 24, borderTop: '3px solid #fff', borderLeft: '3px solid #fff' },
          { top: 24, right: 24, borderTop: '3px solid #fff', borderRight: '3px solid #fff' },
          { bottom: 24, left: 24, borderBottom: '3px solid #fff', borderLeft: '3px solid #fff' },
          { bottom: 24, right: 24, borderBottom: '3px solid #fff', borderRight: '3px solid #fff' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 40, height: 40, ...s }} />
        ))}
        <div style={{
          position: 'absolute', left: 50, right: 50, height: 2, background: 'var(--terracotta)',
          boxShadow: '0 0 12px var(--terracotta)',
          animation: 'scanLine 1.6s ease-in-out infinite alternate',
        }} />
        <style>{`@keyframes scanLine { from { top: 30%; } to { top: 70%; } }`}</style>
        <div className="kr" style={{ color: '#fff', fontSize: 56, fontWeight: 700, opacity: 0.15 }}>콘</div>
        <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          {lang === 'es' ? 'Abriendo Google…' : 'Opening Google…'}
        </div>
      </div>
    </>
  );
}

function LoyaltyReveal({ data, lang, variant }) {
  const [counted, setCounted] = React.useState(0);
  React.useEffect(() => {
    let raf; let start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / 1200);
      setCounted(Math.floor(p * data.points));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [data.points]);

  const tierLabel = data.tier === 'oro' ? (lang === 'es' ? 'Tier Oro ✦' : 'Gold Tier ✦') : (lang === 'es' ? 'Tier Verde' : 'Green Tier');

  if (variant === 'burst') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle, rgba(217,119,87,0.25), transparent 60%)',
          animation: 'softFade 700ms ease-out',
        }} />
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute', width: 240, height: 240, borderRadius: 999,
            border: '2px solid var(--terracotta)',
            animation: `pulseRing 2s ease-out ${i * 0.3}s infinite`,
            opacity: 0.6,
          }} />
        ))}
        <div style={{ textAlign: 'center', position: 'relative', animation: 'pointsCount 500ms' }}>
          <div className="kr" style={{ fontSize: 24, color: 'var(--terracotta)' }}>환영합니다</div>
          <div className="t-h2" style={{ marginTop: 10 }}>{lang === 'es' ? 'Bienvenida,' : 'Welcome,'} {data.name.split(' ')[0]}</div>
          <div className="mono" style={{ fontSize: 72, fontWeight: 700, color: 'var(--terracotta)', marginTop: 16 }}>{counted}</div>
          <div className="t-micro" style={{ color: 'var(--taupe)' }}>{lang === 'es' ? 'PUNTOS DISPONIBLES' : 'POINTS AVAILABLE'}</div>
          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: data.tier === 'oro' ? '#d97706' : '#059669' }}>{tierLabel}</div>
        </div>
      </div>
    );
  }

  if (variant === 'scanner') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--success)', fontSize: 14, fontWeight: 600 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 999, background: 'var(--success)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>✓</div>
          {lang === 'es' ? 'Identificado' : 'Verified'}
        </div>
        <div className="t-h2" style={{ marginTop: 14 }}>{lang === 'es' ? 'Hola,' : 'Hi,'} {data.name}</div>
        <div className="t-body-lg" style={{ color: 'var(--taupe)', marginTop: 6 }}>Koncaffe Club · {tierLabel}</div>
        <div style={{
          marginTop: 28, padding: 24, background: 'var(--ivory)', borderRadius: 'var(--r-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div className="t-micro" style={{ color: 'var(--taupe)' }}>{lang === 'es' ? 'PUNTOS' : 'POINTS'}</div>
            <div className="mono" style={{ fontSize: 48, fontWeight: 700, color: 'var(--terracotta)' }}>{counted}</div>
          </div>
          <div style={{
            width: 80, height: 80, borderRadius: 'var(--r-md)', background: 'var(--charcoal)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-kr)',
            fontSize: 40, fontWeight: 700,
          }}>콘</div>
        </div>
      </div>
    );
  }

  // card (default)
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'softFade 600ms' }}>
      <div className="t-micro" style={{ color: 'var(--terracotta)' }}>{lang === 'es' ? 'BIENVENIDA' : 'WELCOME'}</div>
      <div className="t-h2" style={{ marginTop: 10 }}>{data.name}</div>
      <div style={{
        marginTop: 24, padding: 24, borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, var(--charcoal), #4a3f2f)', color: 'var(--ivory)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: 999, background: 'rgba(217,119,87,0.3)', filter: 'blur(30px)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div className="t-micro" style={{ opacity: 0.7 }}>KONCAFFE CLUB · {(data.tier || 'verde').toUpperCase()}</div>
            <div className="mono" style={{ fontSize: 56, fontWeight: 700, marginTop: 20 }}>{counted}</div>
            <div className="t-xs" style={{ opacity: 0.7, marginTop: 4 }}>
              {lang === 'es' ? 'puntos disponibles' : 'points available'}
            </div>
          </div>
          <div className="kr" style={{ fontSize: 48, fontWeight: 700, opacity: 0.4 }}>콘</div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 24, fontSize: 12, opacity: 0.7 }}>
          <div>⬥ {tierLabel}</div>
          {data.tier === 'oro' && <div>⬥ {lang === 'es' ? 'Bebida gratis disponible' : 'Free drink ready'}</div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenLoyalty });
