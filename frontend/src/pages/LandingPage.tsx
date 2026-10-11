import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'

type Side = 'buy' | 'sell'
type Ev = { label: string; kind: 'add' | 'cancel' | 'market'; side: Side; price?: number; qty: number }
type Book = { bids: Map<number, number>; asks: Map<number, number> }

// Prices are integer ticks (10000 = 100.00) to avoid floating-point issues.
const initialBook = (): Book => ({
  bids: new Map([[9999, 12], [9998, 20], [9997, 15], [9996, 30], [9995, 25]]),
  asks: new Map([[10001, 10], [10002, 18], [10003, 22], [10004, 16], [10005, 28]]),
})

const EVENTS: Ev[] = [
  { label: 'ADD    BUY  8 @ 99.99', kind: 'add', side: 'buy', price: 9999, qty: 8 },
  { label: 'ADD    SELL 6 @ 10001', kind: 'add', side: 'sell', price: 10001, qty: 6 },
  { label: 'MARKET BUY  14', kind: 'market', side: 'buy', qty: 14 },
  { label: 'CANCEL BUY  10 @ 99.98', kind: 'cancel', side: 'buy', price: 9998, qty: 10 },
  { label: 'ADD    SELL 12 @ 100.02', kind: 'add', side: 'sell', price: 10002, qty: 12 },
  { label: 'MARKET SELL 25', kind: 'market', side: 'sell', qty: 25 },
  { label: 'ADD    BUY  20 @ 100.00', kind: 'add', side: 'buy', price: 10000, qty: 20 },
  { label: 'CANCEL SELL 18 @ 100.02', kind: 'cancel', side: 'sell', price: 10002, qty: 18 },
]

function applyEvent(book: Book, ev: Ev): Book {
  const bids = new Map(book.bids)
  const asks = new Map(book.asks)
  const own = ev.side === 'buy' ? bids : asks

  if (ev.kind === 'add') {
    own.set(ev.price!, (own.get(ev.price!) ?? 0) + ev.qty)
  } else if (ev.kind === 'cancel') {
    const left = (own.get(ev.price!) ?? 0) - ev.qty
    if (left > 0) own.set(ev.price!, left)
    else own.delete(ev.price!)
  } else {
    // Market order consumes the opposite side, best price first.
    const opp = ev.side === 'buy' ? asks : bids
    const prices = [...opp.keys()].sort((a, b) => (ev.side === 'buy' ? a - b : b - a))
    let remaining = ev.qty
    for (const p of prices) {
      if (remaining <= 0) break
      const take = Math.min(remaining, opp.get(p)!)
      remaining -= take
      if (take === opp.get(p)) opp.delete(p)
      else opp.set(p, opp.get(p)! - take)
    }
  }
  return { bids, asks }
}

const fmt = (ticks: number) => (ticks / 100).toFixed(2)

function OrderBookPreview() {
  const [step, setStep] = useState(0)

  const book = useMemo(
    () => EVENTS.slice(0, step).reduce(applyEvent, initialBook()),
    [step],
  )

  const bids = [...book.bids.entries()].sort((a, b) => b[0] - a[0]).slice(0, 5)
  const asks = [...book.asks.entries()].sort((a, b) => a[0] - b[0]).slice(0, 5)
  const spread = bids.length && asks.length ? asks[0][0] - bids[0][0] : null
  const maxQty = Math.max(1, ...bids.map((b) => b[1]), ...asks.map((a) => a[1]))

  return (
    <div className="card book-preview">
      <div className="book-head">
        <strong>Order book preview</strong>
        <span className="badge badge-simulated">Simulated data</span>
      </div>

      <div className="book-grid">
        <table className="table" aria-label="Bids">
          <thead><tr><th>Qty</th><th>Bid</th></tr></thead>
          <tbody>
            {bids.map(([p, q]) => (
              <tr key={p}>
                <td>
                  <span className="depth depth-bid" style={{ width: `${(q / maxQty) * 100}%` }} />
                  {q}
                </td>
                <td className="bid">{fmt(p)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="table" aria-label="Asks">
          <thead><tr><th>Ask</th><th>Qty</th></tr></thead>
          <tbody>
            {asks.map(([p, q]) => (
              <tr key={p}>
                <td className="ask">{fmt(p)}</td>
                <td>
                  <span className="depth depth-ask" style={{ width: `${(q / maxQty) * 100}%` }} />
                  {q}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mono spread">Spread: {spread === null ? '—' : fmt(spread)}</p>
      <p className="mono event-line">
        {step === 0 ? 'Initial state' : `Event ${step}/${EVENTS.length}: ${EVENTS[step - 1].label}`}
      </p>

      <div className="book-controls">
        <button className="btn btn-primary" disabled={step >= EVENTS.length} onClick={() => setStep((s) => s + 1)}>
          Next event
        </button>
        <button className="btn" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </button>
        <button className="btn btn-ghost" onClick={() => setStep(0)}>Reset</button>
      </div>
      <p className="note">The same events always produce the same book, which is the idea behind deterministic replay.</p>
    </div>
  )
}

const MODULES = [
  { title: 'Market Replay', status: 'planned', text: 'Process ordered market event streams deterministically so any experiment can be reproduced exactly.' },
  { title: 'Execution Simulation', status: 'planned', text: 'Simulate how orders interact with the book and measure fills, slippage and queue position.' },
  { title: 'Performance Lab', status: 'planned', text: 'Benchmark and profile critical paths with documented methodology. No numbers until they are measured.' },
] as const

const STATUS = [
  { item: 'React + TypeScript frontend', status: 'implemented' },
  { item: 'Interactive order book preview', status: 'simulated' },
  { item: 'Dashboard with demo data', status: 'simulated' },
  { item: 'C++20 order book and matching engine', status: 'implemented' },
  { item: 'Deterministic market replay', status: 'implemented' },
  { item: 'GoogleTest suite', status: 'implemented' },
  { item: 'Benchmarks and perf profiling', status: 'planned' },
  { item: 'Backend API and real authentication', status: 'planned' },
] as const

export default function LandingPage() {
  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <Link to="/" className="logo"><span className="logo-mark" />Furlong</Link>
          <nav className="nav-links">
            <a href="#research" className="hide-mobile">Research</a>
            <a href="#architecture" className="hide-mobile">Architecture</a>
            <a href="#engineering" className="hide-mobile">Engineering</a>
            <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
            <Link to="/login" className="btn btn-primary">Sign in</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="container hero">
          <div>
            <span className="badge badge-planned">Early development</span>
            <h1>Infrastructure for systematic market research.</h1>
            <p className="lead">
              Furlong Research Engine is a C++20 project for exploring limit order books, replaying
              market events, testing execution strategies and measuring system performance.
            </p>
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary">Open dashboard</Link>
              <a href="#status" className="btn">View project status</a>
            </div>
          </div>
          <OrderBookPreview />
        </section>

        <section id="research" className="container section">
          <h2>Research modules</h2>
          <div className="grid-3">
            {MODULES.map((m) => (
              <article key={m.title} className="card">
                <span className={`badge badge-${m.status}`}>{m.status}</span>
                <h3 className="card-title">{m.title}</h3>
                <p>{m.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="architecture" className="container section">
          <h2>Architecture</h2>
          <p>Target architecture. These connections are not implemented yet.</p>
          <div className="flow">
            {['Market events', 'Order book', 'Matching engine', 'Execution results'].map((s, i, arr) => (
              <div key={s} className="flow-step">
                <div className="card flow-box mono">{s}</div>
                {i < arr.length - 1 && <span className="flow-arrow" aria-hidden>→</span>}
              </div>
            ))}
          </div>
        </section>

        <section id="engineering" className="container section">
          <h2>Engineering principles</h2>
          <div className="grid-4">
            {[
              ['Determinism', 'Same input events, same output. Always.'],
              ['Correctness', 'Matching rules verified before anything is optimized.'],
              ['Testing', 'Unit and integration tests for edge cases and invariants.'],
              ['Profiling', 'Measure first. Publish only reproducible benchmarks.'],
            ].map(([t, d]) => (
              <article key={t} className="card">
                <h3 className="card-title">{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="status" className="container section">
          <h2>Development status</h2>
          <div className="card status-list">
            {STATUS.map((s) => (
              <div key={s.item} className="status-row">
                <span>{s.item}</span>
                <span className={`badge badge-${s.status}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="container footer">
        <span>© Furlong Research Engine</span>
        <span className="muted">Not production software. No trading advice.</span>
      </footer>
    </>
  )
}