/* game.jsx — "Encadena": word-chain game where every word must end in the same suffix.
   Themed via a `theme` prop. Exports <Game theme="limpio|fieltro|calido" /> to window. */

const { useState, useEffect, useRef, useCallback } = React;

/* ── Themes ─────────────────────────────────────────────────────────── */
const THEMES = {
  limpio: {
    id: 'limpio', label: 'Limpio',
    font: "'Space Grotesk', system-ui, sans-serif", titleFont: "'Space Grotesk', sans-serif",
    bg: '#F6F7F5', card: '#FFFFFF', soft: '#EEF0EC',
    ink: '#15171C', bgInk: '#15171C', sub: '#6B7280', faint: '#A0A6AE',
    accent: '#3B5BFF', accentInk: '#FFFFFF', accentSoft: '#E9EDFF',
    good: '#178A57', bad: '#DC4233', border: '#E5E7E2',
    radius: 18, tileBg: '#15171C', tileInk: '#FFFFFF', tileBorder: 'transparent',
    shadow: '0 1px 2px rgba(20,24,40,.05), 0 8px 24px rgba(20,24,40,.06)',
    endingStyle: 'plain',
  },
  fieltro: {
    id: 'fieltro', label: 'Fieltro',
    font: "'DM Sans', system-ui, sans-serif", titleFont: "'DM Serif Display', Georgia, serif",
    bg: '#163A2B', card: '#FBF4E4', soft: '#12301F',
    ink: '#1D2B22', bgInk: '#FBF4E4', sub: '#5E6E63', faint: 'rgba(251,244,228,.55)',
    accent: '#E0A23D', accentInk: '#22150A', accentSoft: '#F4E7C8',
    good: '#3FA76A', bad: '#D2604F', border: '#E7D9BF',
    radius: 10, tileBg: '#F3E5C2', tileInk: '#1D2B22', tileBorder: '#C9A85F',
    shadow: '0 2px 0 rgba(0,0,0,.18), 0 10px 26px rgba(0,0,0,.28)',
    felt: true, endingStyle: 'tiles',
  },
  calido: {
    id: 'calido', label: 'Cálido',
    font: "'Fredoka', system-ui, sans-serif", titleFont: "'Fredoka', sans-serif",
    bg: '#FFF6EC', card: '#FFFFFF', soft: '#FFEDDD',
    ink: '#2A2622', bgInk: '#2A2622', sub: '#8A7E72', faint: '#BCAE9F',
    accent: '#FF6A3D', accentInk: '#FFFFFF', accentSoft: '#FFE6DA',
    second: '#1F8A6B', good: '#1F8A6B', bad: '#E0483D', border: '#F2E3D3',
    radius: 22, tileBg: '#FF6A3D', tileInk: '#FFFFFF', tileBorder: 'transparent',
    shadow: '0 2px 4px rgba(120,70,40,.06), 0 12px 30px rgba(120,70,40,.12)',
    endingStyle: 'pill',
  },
};

/* ── Utils ──────────────────────────────────────────────────────────── */
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zñ]/gi, '');
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const SEED = ['faustino', 'corazón', 'mariposa', 'tornillo', 'escarabajo', 'melodía', 'naranja', 'relámpago', 'bicicleta', 'ventanal', 'sombrero', 'aguacate', 'pingüino', 'calendario'];

async function aiExists(word) {
  if (!window.claude || !window.claude.complete) return { valid: true, unverified: true };
  try {
    const out = await window.claude.complete(
      `Eres árbitro de un juego de palabras en español. ¿«${word}» es válida? ` +
      `Cuenta como válida: cualquier palabra del español (incluye conjugaciones, plurales, diminutivos) ` +
      `y nombres propios reales (apellidos, ciudades, países, nombres de personas conocidas). ` +
      `Responde SOLO JSON: {"valida": true|false, "tipo": "comun|propio", "nota": "máx 4 palabras"}.`
    );
    const m = out.match(/\{[\s\S]*\}/);
    if (!m) return { valid: true, unverified: true };
    const j = JSON.parse(m[0]);
    return { valid: !!j.valida, tipo: j.tipo, nota: j.nota };
  } catch (e) {
    return { valid: true, unverified: true };
  }
}

async function aiMove(affix, used, match) {
  if (!window.claude || !window.claude.complete) return null;
  try {
    const where = match === 'inicio' ? `que empiece exactamente con «${affix}»` : `que termine exactamente en «${affix}»`;
    const out = await window.claude.complete(
      `Dame UNA sola palabra en español ${where}. ` +
      `No uses ninguna de estas: ${used.join(', ') || '(ninguna)'}. ` +
      `Puede ser sustantivo común o nombre propio real (apellido, ciudad...). ` +
      `Responde SOLO la palabra en minúsculas, sin puntuación ni explicación.`
    );
    const w = (out || '').trim().split(/\s+/)[0].replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ]/g, '');
    return w || null;
  } catch (e) { return null; }
}

/* ── Atoms ──────────────────────────────────────────────────────────── */
function Btn({ t, kind = 'primary', children, onClick, disabled, style = {} }) {
  const base = {
    border: 'none', cursor: disabled ? 'default' : 'pointer', fontFamily: t.font,
    fontWeight: 600, fontSize: 17, borderRadius: 999, padding: '16px 22px',
    width: '100%', transition: 'transform .12s, background .15s, opacity .15s',
    opacity: disabled ? 0.45 : 1, letterSpacing: t.id === 'fieltro' ? 0 : -0.2,
  };
  const kinds = {
    primary: { background: t.accent, color: t.accentInk, boxShadow: t.shadow },
    ghost: { background: 'transparent', color: t.accent, border: `1.5px solid ${t.accent}`, boxShadow: 'none' },
    soft: { background: t.accentSoft, color: t.accent, boxShadow: 'none' },
    danger: { background: 'transparent', color: t.bad, border: `1.5px solid ${t.bad}33`, boxShadow: 'none' },
  };
  return (
    <button disabled={disabled} onClick={onClick}
      onPointerDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(.975)')}
      onPointerUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onPointerLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      style={{ ...base, ...kinds[kind], ...style }}>{children}</button>
  );
}

function Stepper({ t, value, min, max, onChange, fmt }) {
  const sq = (label, fn, off) => (
    <button onClick={fn} disabled={off} style={{
      width: 40, height: 40, borderRadius: t.id === 'fieltro' ? 8 : 12, border: `1.5px solid ${t.border}`,
      background: t.card, color: off ? t.faint : t.ink, fontSize: 22, lineHeight: 1, cursor: off ? 'default' : 'pointer',
      fontFamily: t.font, fontWeight: 600,
    }}>{label}</button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {sq('−', () => onChange(Math.max(min, value - 1)), value <= min)}
      <div style={{ minWidth: 54, textAlign: 'center', fontWeight: 700, fontSize: 19, color: t.ink }}>{fmt ? fmt(value) : value}</div>
      {sq('+', () => onChange(Math.min(max, value + 1)), value >= max)}
    </div>
  );
}

function Toggle({ t, on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 52, height: 31, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
      background: on ? t.accent : (t.felt ? 'rgba(251,244,228,.25)' : '#D7D9D4'),
      display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'background .2s',
    }}>
      <div style={{ width: 27, height: 27, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
    </button>
  );
}

function Segmented({ t, options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, background: t.felt ? '#EFE2C2' : t.soft, padding: 4, borderRadius: t.id === 'fieltro' ? 10 : 14 }}>
      {options.map((o) => {
        const sel = o.v === value;
        return (
          <button key={o.v} onClick={() => !o.off && onChange(o.v)} disabled={o.off} style={{
            flex: 1, border: 'none', cursor: o.off ? 'default' : 'pointer', padding: '10px 6px',
            borderRadius: t.id === 'fieltro' ? 7 : 10, fontFamily: t.font, fontWeight: 600, fontSize: 13.5,
            background: sel ? t.card : 'transparent', color: o.off ? '#B7B0A0' : (sel ? t.accent : t.sub),
            boxShadow: sel ? t.shadow : 'none', opacity: o.off ? 0.6 : 1, position: 'relative', transition: 'all .15s',
          }}>{o.label}{o.off && <span style={{ display: 'block', fontSize: 9, fontWeight: 600, opacity: .8 }}>pronto</span>}</button>
        );
      })}
    </div>
  );
}

function Hearts({ t, total, left, color }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" style={{ opacity: i < left ? 1 : .25 }}>
          <path d="M12 21s-7.5-4.9-10-9.2C.6 9 1.4 5.6 4.3 4.6 6.3 3.9 8.4 4.7 12 8c3.6-3.3 5.7-4.1 7.7-3.4 2.9 1 3.7 4.4 2.3 7.2C19.5 16.1 12 21 12 21z"
            fill={i < left ? color : 'none'} stroke={color} strokeWidth="1.6" />
        </svg>
      ))}
    </div>
  );
}

function Ending({ t, suffix, match }) {
  const s = suffix.toUpperCase();
  const dash = match === 'inicio' ? 'after' : 'before';
  if (t.endingStyle === 'tiles') {
    return (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {s.split('').map((ch, i) => (
          <div key={i} style={{
            width: 46, height: 52, borderRadius: 6, background: t.tileBg, color: t.tileInk,
            border: `1px solid ${t.tileBorder}`, boxShadow: '0 3px 0 rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.titleFont, fontSize: 30, fontWeight: 700,
          }}>{ch}</div>
        ))}
      </div>
    );
  }
  if (t.endingStyle === 'pill') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, background: t.accentSoft, color: t.accent,
        padding: '10px 22px', borderRadius: 999, fontWeight: 600, flexDirection: dash === 'after' ? 'row-reverse' : 'row' }}>
        <span style={{ fontSize: 20, opacity: .7 }}>‑</span>
        <span style={{ fontSize: 34, letterSpacing: 1 }}>{suffix}</span>
      </div>
    );
  }
  return (
    <div style={{ fontFamily: t.titleFont, fontWeight: 700, color: t.ink, lineHeight: 1, display: 'inline-flex', alignItems: 'baseline', flexDirection: dash === 'after' ? 'row-reverse' : 'row' }}>
      <span style={{ color: t.faint, fontSize: 30 }}>‑</span>
      <span style={{ fontSize: 56, letterSpacing: -1 }}>{suffix}</span>
    </div>
  );
}

/* ── Setup screen ───────────────────────────────────────────────────── */
function Setup({ t, onStart }) {
  const [mode, setMode] = useState('2p');
  const [match, setMatch] = useState('fin');
  const [suffixLen, setSuffixLen] = useState(3);
  const [timerOn, setTimerOn] = useState(false);
  const [timerSec, setTimerSec] = useState(15);
  const [livesOn, setLivesOn] = useState(true);
  const [lives, setLives] = useState(3);
  const [word, setWord] = useState('');

  const onBg = t.felt;
  const labelCol = onBg ? t.bgInk : t.ink;
  const subCol = onBg ? t.faint : t.sub;

  const Row = ({ title, hint, control }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: `1px solid ${onBg ? 'rgba(251,244,228,.12)' : t.border}` }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: labelCol }}>{title}</div>
        {hint && <div style={{ fontSize: 12.5, color: subCol, marginTop: 2 }}>{hint}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  );

  const go = (random) => {
    let start = random ? SEED[Math.floor(Math.random() * SEED.length)] : word.trim();
    if (!start) return;
    onStart({ mode, match, suffixLen, timerOn, timerSec, livesOn, lives, start });
  };
  const canStart = word.trim().length > suffixLen;

  return (
    <div style={{ padding: '64px 22px 28px', display: 'flex', flexDirection: 'column', minHeight: '100%', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div style={{ fontFamily: t.titleFont, fontSize: 40, fontWeight: 700, color: labelCol, letterSpacing: t.id === 'limpio' ? -1.5 : 0 }}>Encadena</div>
        <div style={{ fontSize: 13.5, color: subCol, marginTop: 2, fontWeight: 500 }}>El juego de las terminaciones</div>
      </div>

      <div style={{ background: t.card, borderRadius: t.radius + 4, padding: '8px 18px 18px', boxShadow: t.shadow, marginBottom: 16 }}>
        <Row title="Modo de juego" control={null} />
        <div style={{ paddingBottom: 6 }}>
          <Segmented t={t} value={mode} onChange={setMode} options={[
            { v: '2p', label: '2 jugadores' }, { v: 'app', label: 'Vs. app' }, { v: 'solo', label: 'Solo' }, { v: 'online', label: 'Online', off: true },
          ]} />
        </div>
        <Row title="Encadenar por" control={null} />
        <div style={{ paddingBottom: 6 }}>
          <Segmented t={t} value={match} onChange={setMatch} options={[
            { v: 'fin', label: 'El final' }, { v: 'inicio', label: 'El inicio' },
          ]} />
        </div>
        <Row title="Letras que cuentan" hint={match === 'inicio' ? `Todos repiten las primeras ${suffixLen} letras` : `Todos repiten las últimas ${suffixLen} letras`} control={<Stepper t={t} value={suffixLen} min={2} max={5} onChange={setSuffixLen} />} />
        <Row title="Vidas" hint="Pierdes una por palabra inválida" control={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {livesOn && <Stepper t={t} value={lives} min={1} max={5} onChange={setLives} />}
            <Toggle t={t} on={livesOn} onChange={setLivesOn} />
          </div>} />
        <Row title="Tiempo por turno" hint={timerOn ? `${timerSec} segundos` : 'Sin prisa'} control={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {timerOn && <Stepper t={t} value={timerSec} min={5} max={60} onChange={(v) => setTimerSec(v)} fmt={(v) => v + 's'} />}
            <Toggle t={t} on={timerOn} onChange={setTimerOn} />
          </div>} />
      </div>

      <div style={{ marginBottom: 'auto' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', color: subCol, marginBottom: 8, paddingLeft: 4 }}>Palabra inicial</div>
        <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Ej. Faustino" autoCapitalize="none"
          style={{ width: '100%', boxSizing: 'border-box', padding: '16px 18px', fontSize: 18, fontFamily: t.font, fontWeight: 600,
            borderRadius: t.radius, border: `1.5px solid ${t.border}`, background: t.card, color: t.ink, outline: 'none' }} />
        {word.trim() && (
          <div style={{ fontSize: 13, color: subCol, marginTop: 8, paddingLeft: 4 }}>
            {match === 'inicio'
              ? <>Inicio: <b style={{ color: t.accent }}>{norm(word).slice(0, suffixLen)}‑</b></>
              : <>Terminación: <b style={{ color: t.accent }}>‑{norm(word).slice(-suffixLen)}</b></>}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
        <Btn t={t} onClick={() => go(false)} disabled={!canStart}>Empezar partida</Btn>
        <Btn t={t} kind="soft" onClick={() => go(true)}>Palabra al azar</Btn>
      </div>
    </div>
  );
}

/* ── Play screen ────────────────────────────────────────────────────── */
const PLAYER_LABEL = { A: 'Jugador 1', B: 'Jugador 2', tu: 'Tú', app: 'App' };

function Play({ t, config, suffix, chain, turn, setChain, setTurn, lives, setLives, onEnd, thinking, setThinking }) {
  const [draft, setDraft] = useState('');
  const [msg, setMsg] = useState(null); // {type:'check|ok|err', text}
  const [busy, setBusy] = useState(false);
  const [time, setTime] = useState(config.timerSec);
  const listRef = useRef(null);
  const onBg = t.felt;
  const isPre = config.match === 'inicio';
  const matches = (w) => isPre ? w.startsWith(norm(suffix)) : w.endsWith(norm(suffix));

  // timer
  useEffect(() => { setTime(config.timerSec); }, [turn, config.timerSec]);
  useEffect(() => {
    if (!config.timerOn || busy || thinking) return;
    if (time <= 0) { loseTurn('Se acabó el tiempo'); return; }
    const id = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(id);
  }, [time, config.timerOn, busy, thinking, turn]);

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [chain.length, thinking]);

  const order = config.mode === '2p' ? ['A', 'B'] : config.mode === 'app' ? ['tu', 'app'] : ['tu'];
  const next = (p) => order[(order.indexOf(p) + 1) % order.length];

  const loseTurn = (reason) => onEnd({ loser: turn, reason });

  const accept = useCallback((word, by) => {
    setChain((c) => [...c, { word: cap(word.trim()), by }]);
    setDraft(''); setMsg(null); setTime(config.timerSec);
  }, [config.timerSec, setChain]);

  // app turn
  useEffect(() => {
    if (config.mode !== 'app' || turn !== 'app') return;
    let alive = true;
    setThinking(true);
    (async () => {
      const used = chain.map((c) => norm(c.word));
      const w = await aiMove(suffix, chain.map((c) => c.word), config.match);
      await new Promise((r) => setTimeout(r, 500));
      if (!alive) return;
      if (w && matches(norm(w)) && !used.includes(norm(w))) {
        accept(w, 'app'); setTurn('tu');
      } else {
        onEnd({ loser: 'app', reason: 'La app no encontró palabra' });
      }
      setThinking(false);
    })();
    return () => { alive = false; };
  }, [turn]);

  const submit = async () => {
    const raw = draft.trim();
    if (!raw || busy) return;
    const w = norm(raw);
    if (!matches(w)) { reject(isPre ? `No empieza con ${suffix}‑` : `No termina en ‑${suffix}`); return; }
    if (chain.some((c) => norm(c.word) === w)) { reject('Esa palabra ya se dijo'); return; }
    setBusy(true); setMsg({ type: 'check', text: 'Comprobando…' });
    const res = await aiExists(raw);
    setBusy(false);
    if (!res.valid) { reject(res.nota ? `No válida · ${res.nota}` : 'No parece existir'); return; }
    accept(raw, turn);
    setMsg({ type: 'ok', text: res.unverified ? 'Aceptada (sin conexión)' : '¡Válida!' + (res.nota ? ' · ' + res.nota : '') });
    setTimeout(() => setMsg(null), 1400);
    setTurn(next(turn));
  };

  const reject = (text) => {
    setMsg({ type: 'err', text });
    if (config.livesOn) {
      const nl = { ...lives, [turn]: (lives[turn] ?? 0) - 1 };
      setLives(nl);
      if (nl[turn] <= 0) { setTimeout(() => onEnd({ loser: turn, reason: 'Se quedó sin vidas' }), 600); }
    }
  };

  const turnColor = (turn === 'A' || turn === 'tu') ? t.accent : (t.second || t.accent);
  const headBg = onBg ? 'transparent' : t.card;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      {/* header: ending */}
      <div style={{ padding: '60px 20px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: onBg ? t.faint : t.sub, marginBottom: 10 }}>{isPre ? 'Empieza con' : 'Termina en'}</div>
        <Ending t={t} suffix={suffix} match={config.match} />
      </div>

      {/* turn bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 16px 10px', padding: '10px 16px',
        borderRadius: 999, background: onBg ? 'rgba(251,244,228,.1)' : t.soft }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 9, height: 9, borderRadius: 999, background: turnColor }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: onBg ? t.bgInk : t.ink }}>Turno de {PLAYER_LABEL[turn]}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {config.livesOn && config.mode !== 'solo' && <Hearts t={t} total={config.lives} left={lives[turn] ?? config.lives} color={t.bad} />}
          {config.timerOn && (
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 16, color: time <= 5 ? t.bad : (onBg ? t.bgInk : t.ink) }}>{time}s</span>
          )}
        </div>
      </div>

      {/* chain list */}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {chain.map((c, i) => {
          const mine = c.by === 'A' || c.by === 'tu';
          const col = mine ? t.accent : (t.second || t.accent);
          return (
            <div key={i} style={{ display: 'flex', justifyContent: mine ? 'flex-start' : 'flex-end' }}>
              <div style={{ maxWidth: '80%', background: t.card, borderRadius: t.radius, padding: '11px 16px', boxShadow: t.shadow,
                borderLeft: mine ? `3px solid ${col}` : 'none', borderRight: mine ? 'none' : `3px solid ${col}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: col, marginBottom: 1 }}>
                  {i === 0 ? 'Inicio · ' : ''}{PLAYER_LABEL[c.by]}</div>
                <div style={{ fontSize: 19, fontWeight: 600, color: t.ink }}>
                  {isPre
                    ? <><span style={{ color: col }}>{c.word.slice(0, suffix.length)}</span>{c.word.slice(suffix.length)}</>
                    : <>{c.word.slice(0, -suffix.length)}<span style={{ color: col }}>{c.word.slice(-suffix.length)}</span></>}
                </div>
              </div>
            </div>
          );
        })}
        {thinking && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: t.card, borderRadius: t.radius, padding: '11px 16px', boxShadow: t.shadow, color: t.sub, fontStyle: 'italic', fontSize: 15 }}>La app piensa…</div>
          </div>
        )}
      </div>

      {/* input dock */}
      <div style={{ padding: '10px 16px 26px', background: headBg, borderTop: onBg ? '1px solid rgba(251,244,228,.12)' : `1px solid ${t.border}` }}>
        {msg && (
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8, textAlign: 'center',
            color: msg.type === 'ok' ? t.good : msg.type === 'err' ? t.bad : (onBg ? t.bgInk : t.sub) }}>
            {msg.type === 'check' && <span style={{ marginRight: 6 }}>◌</span>}{msg.text}
          </div>
        )}
        {turn === 'app' ? (
          <div style={{ textAlign: 'center', color: onBg ? t.faint : t.sub, fontSize: 15, padding: '14px 0' }}>Esperando a la app…</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder={isPre ? `palabra en ${suffix}‑` : `palabra en ‑${suffix}`} autoCapitalize="none" disabled={busy}
                style={{ flex: 1, minWidth: 0, padding: '14px 16px', fontSize: 17, fontFamily: t.font, fontWeight: 600,
                  borderRadius: t.radius, border: `1.5px solid ${t.border}`, background: t.card, color: t.ink, outline: 'none' }} />
              <button onClick={submit} disabled={busy || !draft.trim()} style={{ width: 52, flexShrink: 0, borderRadius: t.radius, border: 'none',
                background: t.accent, color: t.accentInk, fontSize: 22, cursor: 'pointer', opacity: busy || !draft.trim() ? .45 : 1 }}>↑</button>
            </div>
            <button onClick={() => loseTurn('No se la sabía')} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none',
              color: t.bad, fontFamily: t.font, fontWeight: 600, fontSize: 14.5, cursor: 'pointer', padding: 6 }}>No me la sé · me rindo</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── End screen ─────────────────────────────────────────────────────── */
function End({ t, config, suffix, chain, result, scores, round, onAgain, onNew }) {
  const onBg = t.felt;
  const labelCol = onBg ? t.bgInk : t.ink;
  const subCol = onBg ? t.faint : t.sub;
  const loserLabel = PLAYER_LABEL[result.loser];
  const order = config.mode === '2p' ? ['A', 'B'] : ['tu', 'app'];
  const winner = order.find((p) => p !== result.loser);
  let winnerLabel;
  if (config.mode === 'solo') winnerLabel = null;
  else if (config.mode === 'app') winnerLabel = result.loser === 'app' ? '¡Ganaste!' : 'Ganó la app';
  else winnerLabel = result.loser === 'A' ? 'Ganó el Jugador 2' : 'Ganó el Jugador 1';

  return (
    <div style={{ padding: '70px 24px 28px', display: 'flex', flexDirection: 'column', minHeight: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.accent, marginBottom: 8 }}>Fin de la partida</div>
      <div style={{ fontFamily: t.titleFont, fontSize: 38, fontWeight: 700, color: labelCol, lineHeight: 1.05, letterSpacing: t.id === 'limpio' ? -1 : 0 }}>
        {config.mode === 'solo' ? `Aguantaste ${chain.length - 1}` : winnerLabel}
      </div>
      <div style={{ fontSize: 15, color: subCol, marginTop: 10 }}>
        {config.mode === 'solo' ? 'palabras seguidas' : `${loserLabel} · ${result.reason}`}
      </div>

      {config.mode !== 'solo' && round > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 20,
          background: t.card, borderRadius: 999, padding: '12px 22px', boxShadow: t.shadow, alignSelf: 'center' }}>
          {order.map((p, i) => (
            <React.Fragment key={p}>
              {i === 1 && <span style={{ color: t.faint, fontWeight: 700 }}>–</span>}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: t.titleFont, fontSize: 26, fontWeight: 700, color: p === winner ? t.accent : t.ink }}>{scores[p] || 0}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.sub, marginTop: 1 }}>{PLAYER_LABEL[p]}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, margin: '26px 0' }}>
        {[{ n: chain.length, l: 'palabras' }, { n: (config.match === 'inicio' ? suffix + '‑' : '‑' + suffix), l: config.match === 'inicio' ? 'inicio' : 'terminación' }].map((s, i) => (
          <div key={i} style={{ flex: 1, background: t.card, borderRadius: t.radius, padding: '18px 8px', boxShadow: t.shadow }}>
            <div style={{ fontFamily: t.titleFont, fontSize: 30, fontWeight: 700, color: t.accent }}>{s.n}</div>
            <div style={{ fontSize: 12.5, color: t.sub, marginTop: 2, fontWeight: 500 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: t.card, borderRadius: t.radius + 2, padding: '6px 18px', boxShadow: t.shadow, textAlign: 'left', marginBottom: 'auto', maxHeight: 220, overflowY: 'auto' }}>
        {chain.map((c, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < chain.length - 1 ? `1px solid ${t.border}` : 'none' }}>
            <span style={{ fontSize: 15.5, fontWeight: 600, color: t.ink }}>{c.word}</span>
            <span style={{ fontSize: 12.5, color: t.sub, alignSelf: 'center' }}>{i === 0 ? 'inicio' : PLAYER_LABEL[c.by]}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <Btn t={t} onClick={onAgain}>Otra ronda</Btn>
        <div style={{ fontSize: 12.5, color: subCol, textAlign: 'center', marginTop: -2 }}>
          {config.mode === 'solo' ? 'Palabra nueva al azar' : 'Palabra nueva · empieza quien perdió'}
        </div>
        <Btn t={t} kind="ghost" onClick={onNew}>Cambiar ajustes</Btn>
      </div>
    </div>
  );
}

/* ── Root ───────────────────────────────────────────────────────────── */
function Game({ theme = 'limpio' }) {
  const t = THEMES[theme] || THEMES.limpio;
  const [phase, setPhase] = useState('setup');
  const [config, setConfig] = useState(null);
  const [suffix, setSuffix] = useState('');
  const [chain, setChain] = useState([]);
  const [turn, setTurn] = useState('A');
  const [lives, setLives] = useState({});
  const [result, setResult] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [scores, setScores] = useState({});
  const [round, setRound] = useState(1);

  const begin = (cfg, opts = {}) => {
    const sfx = cfg.match === 'inicio' ? norm(cfg.start).slice(0, cfg.suffixLen) : norm(cfg.start).slice(-cfg.suffixLen);
    setConfig(cfg); setSuffix(sfx);
    const seedBy = opts.seedBy || (cfg.mode === '2p' ? 'A' : 'tu');
    setChain([{ word: cap(cfg.start.trim()), by: seedBy }]);
    const second = opts.firstTurn || (cfg.mode === '2p' ? 'B' : cfg.mode === 'app' ? 'app' : 'tu');
    setTurn(second);
    setLives(cfg.mode === '2p' ? { A: cfg.lives, B: cfg.lives } : { tu: cfg.lives, app: cfg.lives });
    if (!opts.keepScore) { setScores(cfg.mode === '2p' ? { A: 0, B: 0 } : { tu: 0, app: 0 }); setRound(1); }
    setThinking(false); setResult(null); setPhase('play');
  };
  const end = (r) => {
    setResult(r); setThinking(false);
    if (config.mode !== 'solo') {
      const order = config.mode === '2p' ? ['A', 'B'] : ['tu', 'app'];
      const winner = order.find((p) => p !== r.loser);
      if (winner) setScores((s) => ({ ...s, [winner]: (s[winner] || 0) + 1 }));
    }
    setPhase('end');
  };
  const again = () => {
    const pool = SEED.filter((w) => w !== config.start);
    const start = pool[Math.floor(Math.random() * pool.length)];
    const order = config.mode === '2p' ? ['A', 'B'] : config.mode === 'app' ? ['tu', 'app'] : ['tu'];
    const loser = result ? result.loser : order[0];
    const winner = order.find((p) => p !== loser) || order[0];
    setRound((r) => r + 1);
    begin({ ...config, start }, { keepScore: true, seedBy: winner, firstTurn: config.mode === 'solo' ? 'tu' : loser });
  };
  const reset = () => { setPhase('setup'); setConfig(null); setScores({}); setRound(1); };

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.bgInk, fontFamily: t.font, position: 'relative', overflow: 'hidden',
      backgroundImage: t.felt ? 'radial-gradient(rgba(255,255,255,.035) 1px, transparent 1px)' : 'none', backgroundSize: t.felt ? '4px 4px' : 'auto' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
        {phase === 'setup' && <Setup t={t} onStart={begin} />}
        {phase === 'play' && <Play t={t} config={config} suffix={suffix} chain={chain} turn={turn}
          setChain={setChain} setTurn={setTurn} lives={lives} setLives={setLives} onEnd={end} thinking={thinking} setThinking={setThinking} />}
        {phase === 'end' && <End t={t} config={config} suffix={suffix} chain={chain} result={result} scores={scores} round={round} onAgain={again} onNew={reset} />}
      </div>
    </div>
  );
}

window.Game = Game;
window.GAME_THEMES = THEMES;
