import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal, { CountUp } from '../components/Reveal'
import { CursorGlow, Tilt, FlipCard, FlipWords } from '../components/Effects'
import './LandingPage.css'

const GITHUB = 'https://github.com/furlong-cp/furlong-research-engine'
const fmt = (ticks: number) => (ticks / 100).toFixed(2)

/* ---------- Simplified matching demo (same rules as the C++ engine) ---------- */
type Side = 'buy' | 'sell'
type Rest = { id: number; side: Side; price: number; qty: number }
type Trade = { maker: number; price: number; qty: number }
type Book = { bids: Rest[]; asks: Rest[] }
type Result = { book: Book; trades: Trade[]; order: { id: number; side: Side; qty: number } }

const startBook = (): Book => ({
  bids: [
    { id: 1, side: 'buy', price: 9999, qty: 10 },
    { id: 2, side: 'buy', price: 9998, qty: 15 },
    { id: 3, side: 'buy', price: 9997, qty: 20 },
  ],
  asks: [
    { id: 4, side: 'sell', price: 10001, qty: 10 },
    { id: 5, side: 'sell', price: 10002, qty: 15 },
    { id: 6, side: 'sell', price: 10003, qty: 20 },
    { id: 7, side: 'sell', price: 10004, qty: 25 },
  ],
})

const sortBook = (b: Book): Book => ({
  bids: [...b.bids].sort((a, c) => c.price - a.price || a.id - c.id),
  asks: [...b.asks].sort((a, c) => a.price - c.price || a.id - c.id),
})

function submit(book: Book, o: { id: number; side: Side; type: 'limit' | 'market'; price: number; qty: number }) {
  const bids = book.bids.map((x) => ({ ...x }))
  const asks = book.asks.map((x) => ({ ...x }))
  const opp = o.side === 'buy' ? asks : bids
  const trades: Trade[] = []
  let left = o.qty
  while (left > 0 && opp.length) {
    const best = opp[0]
    if (o.type === 'limit') {
      const crosses = o.side === 'buy' ? best.price <= o.price : best.price >= o.price
      if (!crosses) break
    }
    const take = Math.min(left, best.qty)
    trades.push({ maker: best.id, price: best.price, qty: take })
    best.qty -= take
    left -= take
    if (best.qty === 0) opp.shift()
  }
  const rested = left > 0 && o.type === 'limit'
  if (rested) (o.side === 'buy' ? bids : asks).push({ id: o.id, side: o.side, price: o.price, qty: left })
  return { book: sortBook({ bids, asks }), trades, rested }
}

const filledQty = (t: Trade[]) => t.reduce((s, x) => s + x.qty, 0)
const avgPrice = (t: Trade[]) => {
  const q = filledQty(t)
  return q ? t.reduce((s, x) => s + x.price * x.qty, 0) / q : 0
}

const MISSIONS = [
  {
    title: 'Smart buyer',
    text: 'Buy 25 units with an average price of 100.02 or less.',
    check: (r: Result) => r.order.side === 'buy' && filledQty(r.trades) >= 25 && avgPrice(r.trades) <= 10002,
  },
  {
    title: 'Price improver',
    text: 'Place a buy order that becomes the new best bid, without trading.',
    check: (r: Result) => r.order.side === 'buy' && r.trades.length === 0 && r.book.bids[0]?.id === r.order.id,
  },
  {
    title: 'Book sweeper',
    text: 'Clear every sell level in the book.',
    check: (r: Result) => r.book.asks.length === 0,
  },
]

function EngineLab() {
  const [book, setBook] = useState<Book>(startBook())
  const [nextId, setNextId] = useState(100)
  const [side, setSide] = useState<Side>('buy')
  const [type, setType] = useState<'limit' | 'market'>('market')
  const [price, setPrice] = useState('100.00')
  const [qty, setQty] = useState('10')
  const [log, setLog] = useState<string[]>([])
  const [done, setDone] = useState<boolean[]>([false, false, false])
  const [msg, setMsg] = useState('Send an order and watch the book react.')

  const maxQty = Math.max(1, ...book.bids.map((x) => x.qty), ...book.asks.map((x) => x.qty))
  const spread = book.bids.length && book.asks.length ? book.asks[0].price - book.bids[0].price : null

  function send() {
    const q = Math.floor(Number(qty))
    const p = Math.round(Number(price) * 100)
    if (!(q >= 1)) { setMsg('Enter a quantity of 1 or more.'); return }
    if (type === 'limit' && !(p > 0)) { setMsg('Enter a valid price.'); return }

    const id = nextId
    const res = submit(book, { id, side, type, price: p, qty: q })
    setBook(res.book)
    setNextId(id + 1)

    const desc = `#${id} ${side.toUpperCase()} ${q}${type === 'limit' ? ` @ ${fmt(p)}` : ' MARKET'}`
    const outcome = res.trades.length ? res.trades.map((t) => `${t.qty}@${fmt(t.price)}`).join(', ') : 'no trade'
    setLog((l) => [`${desc} → ${outcome}${res.rested ? ' (rest in book)' : ''}`, ...l].slice(0, 6))

    const r: Result = { book: res.book, trades: res.trades, order: { id, side, qty: q } }
    const nd = [...done]
    let newly = ''
    MISSIONS.forEach((m, i) => {
      if (!nd[i] && m.check(r)) { nd[i] = true; newly = m.title }
    })
    setDone(nd)

    if (newly) setMsg(`Mission complete: ${newly}!`)
    else if (res.trades.length) setMsg(`Filled ${filledQty(res.trades)} at an average of ${fmt(avgPrice(res.trades))}.`)
    else if (res.rested) setMsg('No match. Your order is resting in the book.')
    else setMsg('No liquidity. The market order was discarded.')
  }

  function reset() {
    setBook(startBook()); setNextId(100); setLog([]); setDone([false, false, false])
    setMsg('Book reset. Send an order and watch the book react.')
  }

  const completed = done.filter(Boolean).length

  return (
    <div className="lab card glow">
      <div className="lab-top">
        <div>
          <strong>Engine Lab</strong>
          <span className="muted"> · runs in your browser</span>
        </div>
        <span className="badge badge-simulated">Simulated data</span>
      </div>

      <div className="lab-grid">
        <div className="lab-book">
          <div className="lab-rows">
            {[...book.asks].reverse().map((o) => (
              <div key={`${o.id}-${o.qty}`} className="lab-row flash-row">
                <span className="depth depth-ask" style={{ width: `${(o.qty / maxQty) * 100}%` }} />
                <span className="ask mono">{fmt(o.price)}</span>
                <span className="mono">{o.qty}{o.id >= 100 ? ' · you' : ''}</span>
              </div>
            ))}
            <div className="lab-spread mono">Spread {spread === null ? '—' : fmt(spread)}</div>
            {book.bids.map((o) => (
              <div key={`${o.id}-${o.qty}`} className="lab-row flash-row">
                <span className="depth depth-bid" style={{ width: `${(o.qty / maxQty) * 100}%` }} />
                <span className="bid mono">{fmt(o.price)}</span>
                <span className="mono">{o.qty}{o.id >= 100 ? ' · you' : ''}</span>
              </div>
            ))}
          </div>
          <ul className="lab-log mono">
            {log.length === 0 && <li className="muted">Event log is empty.</li>}
            {log.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>

        <div className="lab-controls">
          <div className="seg">
            <button className={side === 'buy' ? 'on buy' : ''} onClick={() => setSide('buy')}>Buy</button>
            <button className={side === 'sell' ? 'on sell' : ''} onClick={() => setSide('sell')}>Sell</button>
          </div>
          <div className="seg">
            <button className={type === 'market' ? 'on' : ''} onClick={() => setType('market')}>Market</button>
            <button className={type === 'limit' ? 'on' : ''} onClick={() => setType('limit')}>Limit</button>
          </div>
          <label className="lab-label">Quantity
            <input className="input mono" value={qty} onChange={(e) => setQty(e.target.value)} inputMode="numeric" />
          </label>
          {type === 'limit' && (
            <label className="lab-label">Limit price
              <input className="input mono" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
            </label>
          )}
          <button className="btn btn-primary full" onClick={send}>Send order</button>
          <button className="btn btn-ghost full" onClick={reset}>Reset book</button>
          <p className="lab-msg" role="status">{msg}</p>
        </div>

        <div className="lab-missions">
          <h4>Missions <span className="muted">{completed}/{MISSIONS.length}</span></h4>
          {MISSIONS.map((m, i) => (
            <div key={m.title} className={`mission ${done[i] ? 'done' : ''}`}>
              <span className="tick">{done[i] ? '✓' : i + 1}</span>
              <div><strong>{m.title}</strong><p>{m.text}</p></div>
            </div>
          ))}
          {completed === MISSIONS.length && <p className="win">All missions complete. Create an account to run real experiments.</p>}
        </div>
      </div>
      <p className="note">
        A simplified TypeScript demo of the matching rules in the C++ engine. It is not connected to the C++ engine yet.
      </p>
    </div>
  )
}

/* ---------- Illustrations (SVG) ---------- */
function HeroChart() {
  const line = '0,230 40,215 80,222 120,180 160,190 200,140 240,155 280,110 320,125 360,80 400,95 440,50 480,62 520,30'
  const candles = [
    [40, 205, 30, true], [100, 190, 40, false], [160, 165, 38, true], [220, 140, 45, true],
    [280, 100, 40, false], [340, 85, 42, true], [400, 70, 40, true], [460, 45, 38, false],
  ] as const
  return (
    <svg viewBox="0 0 520 300" className="hero-chart" role="img" aria-label="Illustration of a rising price chart (simulated)">
      <defs>
        <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3dd9b0" stopOpacity="0.35" />
          <stop offset="1" stopColor="#3dd9b0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[60, 120, 180, 240].map((y) => <line key={y} x1="0" x2="520" y1={y} y2={y} stroke="#24325f" strokeDasharray="4 6" />)}
      <polygon points={`0,300 ${line} 520,300`} fill="url(#area)" className="chart-area" />
      {candles.map(([x, y, h, up], i) => (
        <g key={x} className="candle" style={{ animationDelay: `${i * 120}ms` }}>
          <line x1={x} x2={x} y1={y - 12} y2={y + h + 12} stroke={up ? '#2ecc8f' : '#ff5c6c'} />
          <rect x={x - 7} y={y} width="14" height={h} rx="2" fill={up ? '#2ecc8f' : '#ff5c6c'} />
        </g>
      ))}
      <polyline points={line} fill="none" stroke="#5aa9ff" strokeWidth="3" strokeLinejoin="round" className="chart-line" />
      <text x="12" y="20" fill="#9aa8c7" fontSize="12" fontFamily="monospace">SIMULATED ILLUSTRATION</text>
    </svg>
  )
}

function StepIcon({ name }: { name: 'events' | 'book' | 'match' | 'results' }) {
  const c = { stroke: '#3dd9b0', strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  return (
    <svg viewBox="0 0 64 64" className="step-icon" aria-hidden>
      {name === 'events' && <><path {...c} d="M12 18h28M12 32h40M12 46h24" /><path {...c} d="M46 14l6 4-6 4" /></>}
      {name === 'book' && <><path {...c} d="M12 20h14M12 32h22M12 44h30" /><path {...c} d="M52 20H38M52 32H42M52 44H34" stroke="#ff5c6c" /></>}
      {name === 'match' && <><path {...c} d="M8 32h18l6-12 6 24 6-12h12" /></>}
      {name === 'results' && <><path {...c} d="M10 52V12M10 52h44" /><path {...c} d="M16 42l12-12 8 8 16-18" stroke="#5aa9ff" /></>}
    </svg>
  )
}

function ScrollProgress() {
  const [w, setW] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setW(h > 0 ? (window.scrollY / h) * 100 : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="progress" style={{ width: `${w}%` }} />
}

const HEADLINE = ['Markets are', 'puzzles.', 'We build', 'the engine.']
const TICKER = ['Limit order books', 'Deterministic replay', 'Price-time priority', 'C++20', 'Execution research', 'Reproducible experiments', 'Tested matching rules']

const MODULES = [
  { title: 'Market Replay', text: 'Feed an ordered stream of market events into the engine and get exactly the same result every time. Built and tested.' },
  { title: 'Execution Simulation', text: 'Study how orders interact with the book: fills, slippage and queue position. On the roadmap.' },
  { title: 'Performance Lab', text: 'Benchmark and profile critical paths with documented methods. No numbers are published until they are measured.' },
]

const STEPS = [
  { icon: 'events', title: 'Events arrive', text: 'New orders and cancellations enter in a fixed, ordered stream.' },
  { icon: 'book', title: 'The book updates', text: 'Resting orders are organised by price, then by arrival time.' },
  { icon: 'match', title: 'Orders match', text: 'Crossing orders trade at the resting order\u2019s price.' },
  { icon: 'results', title: 'Results are reproduced', text: 'Run the same events again and get identical trades.' },
] as const

export default function LandingPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />

      <header className="nav">
        <div className="container nav-inner">
          <Link to="/" className="logo"><span className="logo-mark" />Furlong</Link>
          <nav className="nav-links">
            <a href="#puzzles" className="hide-mobile">Quant puzzles</a>
            <a href="#field-guide" className="hide-mobile">Field guide</a>
            <a href="#what" className="hide-mobile">Research</a>
            <a href="#lab" className="hide-mobile">Engine Lab</a>
            <a href="#how" className="hide-mobile">How it works</a>
            <a href={GITHUB} target="_blank" rel="noreferrer" className="hide-mobile">GitHub</a>
            <Link to="/login" className="btn btn-ghost">Log in</Link>
            <Link to="/signup" className="btn btn-primary">Sign up</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero-wrap">
          <div className="orb orb-a" /><div className="orb orb-b" /><div className="hero-grid" />
          <div className="container hero">
            <div>
              <span className="badge badge-planned pulse-badge">Early development</span>
              <h1>
                {HEADLINE.map((w, i) => (
                  <span key={w} className={`word ${i >= 2 ? 'grad' : ''}`} style={{ animationDelay: `${150 + i * 120}ms` }}>{w}</span>
                ))}
              </h1>
              <p className="flip-line fade-in" style={{ animationDelay: '800ms' }}>
                Built for <FlipWords words={['market replay', 'execution research', 'performance testing']} />
              </p>
              <p className="lead fade-in" style={{ animationDelay: '950ms' }}>
                Explore the ideas behind quantitative finance: probability, market microstructure, algorithms and the systems that turn research into reproducible experiments.
              </p>
              <div className="hero-actions fade-in" style={{ animationDelay: '1100ms' }}>
                <Link to="/signup" className="btn btn-primary">Create free account</Link>
                <a href="#lab" className="btn">Try the engine now ↓</a>
              </div>
            </div>
            <div className="fade-in" style={{ animationDelay: '600ms' }}>
              <Tilt className="card chart-card"><HeroChart /></Tilt>
            </div>
          </div>
        </section>

        <div className="ticker" aria-hidden>
          <div className="ticker-track">
            {[...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}<i>◆</i></span>)}
          </div>
        </div>

        {/* QUANT PUZZLE GALLERY */}
        <section id="puzzles" className="container section puzzle-section">
          <Reveal>
            <div className="section-kicker">THE QUANT MINDSET / 01</div>
            <h2>Train your eye. Challenge your intuition.</h2>
            <p className="section-lead">Quant research lives at the intersection of probability, patterns, computation and market behaviour. Start by exploring the questions behind the numbers.</p>
          </Reveal>

          <div className="puzzle-gallery">
            <Reveal className="puzzle-card puzzle-card--wide" delay={80}>
              <div className="puzzle-image-wrap">
                <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=85" alt="Mathematical equations and geometric formulas" loading="lazy" />
                <span className="puzzle-index">01 / PROBABILITY</span>
              </div>
              <div className="puzzle-card-copy">
                <span className="puzzle-label">THINK IN DISTRIBUTIONS</span>
                <h3>The probability trap</h3>
                <p>When intuition and the numbers disagree, which one do you trust? Explore conditional probability, expected value and risk.</p>
                <a href="#lab">Explore the engine <span aria-hidden="true">↗</span></a>
              </div>
            </Reveal>

            <Reveal className="puzzle-card" delay={150}>
              <div className="puzzle-image-wrap">
                <img src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=85" alt="Scientific visualization representing the human brain and neural connections" loading="lazy" />
                <span className="puzzle-index">02 / COGNITION</span>
              </div>
              <div className="puzzle-card-copy">
                <span className="puzzle-label">QUESTION YOUR INSTINCTS</span>
                <h3>The brain vs. Bayes</h3>
                <p>Learn why our first guess is not always our best estimate.</p>
                <a href="#how">Follow the reasoning <span aria-hidden="true">↗</span></a>
              </div>
            </Reveal>

            <Reveal className="puzzle-card" delay={220}>
              <div className="puzzle-image-wrap">
                <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=85" alt="Financial market charts displayed on a trading screen" loading="lazy" />
                <span className="puzzle-index">03 / MICROSTRUCTURE</span>
              </div>
              <div className="puzzle-card-copy">
                <span className="puzzle-label">READ THE MARKET</span>
                <h3>Inside the order book</h3>
                <p>Prices are only part of the story. Queue position and liquidity shape how orders interact.</p>
                <a href="#lab">Enter the simulation <span aria-hidden="true">↗</span></a>
              </div>
            </Reveal>

            <Reveal className="puzzle-card" delay={100}>
              <div className="puzzle-image-wrap">
                <img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=85" alt="Mathematical notation and equations on a study surface" loading="lazy" />
                <span className="puzzle-index">04 / MATHEMATICS</span>
              </div>
              <div className="puzzle-card-copy">
                <span className="puzzle-label">FIND THE STRUCTURE</span>
                <h3>Patterns in the noise</h3>
                <p>Separate a compelling visual pattern from a result that can actually be tested.</p>
                <a href="#what">Explore research modules <span aria-hidden="true">↗</span></a>
              </div>
            </Reveal>

            <Reveal className="puzzle-card puzzle-card--wide puzzle-card--brain" delay={180}>
              <div className="puzzle-image-wrap">
                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85" alt="Close-up of a circuit board representing computation and systems engineering" loading="lazy" />
                <span className="puzzle-index">05 / COMPUTATION</span>
              </div>
              <div className="puzzle-card-copy">
                <span className="puzzle-label">MAKE IT REPRODUCIBLE</span>
                <h3>From an idea to an experiment</h3>
                <p>A hypothesis is a starting point. Good tooling makes the process repeatable, measurable and open to scrutiny.</p>
                <a href="#lab">Run a small experiment <span aria-hidden="true">↗</span></a>
              </div>
            </Reveal>
          </div>

          <div className="puzzle-bottomline">
            <span>MATHEMATICS</span><i>×</i><span>STATISTICS</span><i>×</i><span>ALGORITHMS</span><i>×</i><span>MARKETS</span>
          </div>
        </section>

        {/* WHAT WE DO */}
        <section id="what" className="container section">
          <Reveal>
            <h2>What we do</h2>
            <p className="section-lead">We build the plumbing behind market research: an order book, a matching engine and a replay system you can trust, because every result can be reproduced.</p>
          </Reveal>
          <div className="grid-3">
            {MODULES.map((m, i) => (
              <Reveal key={m.title} delay={i * 150}>
                <FlipCard
                  front={<><h3 className="card-title">{m.title}</h3><p className="muted">Hover or tap to flip →</p></>}
                  back={<><h3 className="card-title">{m.title}</h3><p>{m.text}</p></>}
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* VISUAL FIELD GUIDE */}
        <section className="container section field-guide" id="field-guide">
          <Reveal>
            <div className="section-kicker">A FIELD GUIDE TO THE QUANT WORLD / 02</div>
            <h2>Different lenses. One connected system.</h2>
            <p className="section-lead">The interesting work happens where disciplines meet. Mathematics gives us a language; statistics helps us reason under uncertainty; code turns ideas into experiments.</p>
          </Reveal>
          <div className="field-grid">
            <Reveal className="field-tile field-tile--large" delay={80}>
              <img src="https://images.unsplash.com/photo-1453738773917-9c3eff1db985?auto=format&fit=crop&w=1400&q=85" alt="Abstract mathematical and scientific structures" loading="lazy" />
              <div className="field-overlay"><span>01 / MATHEMATICS</span><h3>Model the world.</h3><p>Turn a messy question into assumptions, variables and a model you can inspect.</p></div>
            </Reveal>
            <Reveal className="field-tile" delay={150}>
              <img src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=900&q=85" alt="Scientific laboratory with blue light" loading="lazy" />
              <div className="field-overlay"><span>02 / STATISTICS</span><h3>Respect uncertainty.</h3><p>Ask what the data supports—and what it cannot tell you.</p></div>
            </Reveal>
            <Reveal className="field-tile" delay={220}>
              <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85" alt="Detailed circuit board and computer hardware" loading="lazy" />
              <div className="field-overlay"><span>03 / SYSTEMS</span><h3>Make it run.</h3><p>Build systems that are measurable, repeatable and understandable.</p></div>
            </Reveal>
          </div>
          <div className="field-caption"><span>MODEL</span><i>→</i><span>TEST</span><i>→</i><span>MEASURE</span><i>→</i><span>REPEAT</span></div>
        </section>

        {/* PHOTO BANNER 1 */}
        <section className="photo photo-1">
          <Reveal className="container photo-text">
            <h2>Every market event, replayed exactly.</h2>
            <p>Same input, same output. No randomness, no clocks, no floating-point prices.</p>
          </Reveal>
        </section>

        {/* ENGINE LAB */}
        <section id="lab" className="container section">
          <Reveal>
            <h2>Don&apos;t just read about it. Run it.</h2>
            <p className="section-lead">Send orders into a live book. Complete three missions. See price-time priority in action.</p>
          </Reveal>
          <Reveal delay={100}><EngineLab /></Reveal>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="container section">
          <Reveal><h2>How it works</h2></Reveal>
          <div className="steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 140}>
                <div className="card step hover-lift">
                  <span className="step-n mono">0{i + 1}</span>
                  <StepIcon name={s.icon} />
                  <h3 className="card-title">{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* QUESTIONS WORTH EXPLORING */}
        <section className="container section question-section" id="questions">
          <Reveal>
            <div className="section-kicker">THINK LIKE A RESEARCHER / 03</div>
            <h2>Good questions are better than confident guesses.</h2>
            <p className="section-lead">A striking chart is not a conclusion. A plausible story is not evidence. Research begins when we turn curiosity into a testable question.</p>
          </Reveal>
          <div className="question-grid">
            <Reveal delay={70} className="question-card">
              <div className="question-image"><img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=85" alt="Mathematical equations on a page" loading="lazy" /><span>PROBABILITY</span></div>
              <div className="question-copy"><span className="question-number">Q. 001</span><h3>How surprising is surprising?</h3><p>Compare intuition with conditional probability, base rates and expected value.</p><a href="#puzzles">Explore the ideas ↗</a></div>
            </Reveal>
            <Reveal delay={150} className="question-card">
              <div className="question-image"><img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=85" alt="Financial market data on trading monitors" loading="lazy" /><span>MARKET STRUCTURE</span></div>
              <div className="question-copy"><span className="question-number">Q. 002</span><h3>What happens between prices?</h3><p>Look beyond the last traded price to liquidity, spread, order flow and queue position.</p><a href="#lab">Open the Engine Lab ↗</a></div>
            </Reveal>
            <Reveal delay={230} className="question-card">
              <div className="question-image"><img src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=85" alt="Code displayed on a computer screen" loading="lazy" /><span>COMPUTATION</span></div>
              <div className="question-copy"><span className="question-number">Q. 003</span><h3>Can you reproduce the result?</h3><p>A useful experiment should be repeatable, testable and clear about its limitations.</p><a href="#how">See the process ↗</a></div>
            </Reveal>
          </div>
        </section>

        {/* STATS */}
        <section className="container stats">
          <Reveal className="stat-item"><span className="stat-num mono"><CountUp to={14} /></span><span className="muted">Automated tests passing</span></Reveal>
          <Reveal delay={120} className="stat-item"><span className="stat-num mono"><CountUp to={5} /></span><span className="muted">Engine components</span></Reveal>
          <Reveal delay={240} className="stat-item"><span className="stat-num mono"><CountUp to={0} /></span><span className="muted">Floating-point prices</span></Reveal>
        </section>

        {/* PHOTO BANNER 2 / CTA */}
        <section className="photo photo-2">
          <Reveal className="container photo-text">
            <h2>Ready to run your own experiment?</h2>
            <p>Create an account to open the research workspace.</p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
              <Link to="/login" className="btn">Log in</Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-cols">
          <div>
            <Link to="/" className="logo"><span className="logo-mark" />Furlong</Link>
            <p className="small-text">Quantitative research infrastructure. An independent engineering project.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <a href="#puzzles">Quant puzzles</a><a href="#field-guide">Field guide</a><a href="#what">Research</a><a href="#lab">Engine Lab</a><a href="#how">How it works</a>
          </div>
          <div>
            <h4>Project</h4>
            <a href={GITHUB} target="_blank" rel="noreferrer">Source code</a>
            <a href={`${GITHUB}/tree/main/docs`} target="_blank" rel="noreferrer">Documentation</a>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Log in</Link><Link to="/signup">Sign up</Link>
          </div>
        </div>

        <div className="container legal">
          <p>© 2026 Furlong Research Engine. All rights reserved.</p>
          <p>
            Furlong Research Engine is an independent software engineering and research project. It is not a
            broker-dealer, exchange, investment adviser, bank or trading firm, is not registered with or
            regulated by any financial authority, holds no client money and places no real orders in any market.
          </p>
          <p>
            All order books, prices, trades and results on this website are simulated or produced by test
            software for demonstration. They do not represent real market data or real trading performance.
          </p>
          <p>
            Nothing on this website is investment, legal or tax advice, or an offer or solicitation to buy or
            sell any security or financial instrument. The project is in early development and is provided
            &ldquo;as is&rdquo; without warranties of any kind.
          </p>
          <p>
            Account sign-up is currently a prototype and does not create real accounts. Do not enter a password
            you use elsewhere. Product names, logos and trademarks mentioned belong to their respective owners.
          </p>
        </div>
      </footer>
    </>
  )
}