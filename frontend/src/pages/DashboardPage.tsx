import { Link } from 'react-router-dom'
import './DashboardPage.css'

const NAV = ['Overview', 'Order book', 'Replay', 'Experiments', 'Benchmarks', 'Logs']

const BIDS: [number, number][] = [[99.99, 12], [99.98, 20], [99.97, 15], [99.96, 30], [99.95, 25]]
const ASKS: [number, number][] = [[100.01, 10], [100.02, 18], [100.03, 22], [100.04, 16], [100.05, 28]]

const LOG = [
  { t: '00:00:01', level: 'INFO', msg: 'Demo session started (static sample data).' },
  { t: '00:00:01', level: 'WARN', msg: 'C++ engine not connected. Showing demo data only.' },
  { t: '00:00:02', level: 'INFO', msg: 'Benchmarks unavailable: no engine build to measure.' },
]

export default function DashboardPage() {
  const spread = (ASKS[0][0] - BIDS[0][0]).toFixed(2)
  const mid = ((ASKS[0][0] + BIDS[0][0]) / 2).toFixed(3)

  const metrics = [
    { label: 'Mid price', value: mid, demo: true },
    { label: 'Spread', value: spread, demo: true },
    { label: 'Events replayed', value: '—', demo: false },
    { label: 'Engine', value: 'Not connected', demo: false },
  ]

  return (
    <div className="dash">
      <aside className="dash-side">
        <Link to="/" className="logo"><span className="logo-mark" />Furlong</Link>
        <nav className="side-nav" aria-label="Workspace">
          {NAV.map((n, i) => (
            <button key={n} className={`side-item ${i === 0 ? 'active' : ''}`}>{n}</button>
          ))}
        </nav>
        <div className="side-status mono">
          <span className="dot dot-off" /> engine: offline
        </div>
      </aside>

      <main className="dash-main">
        <div className="demo-banner" role="status">
          <span className="badge badge-simulated">Demo data</span>
          Values below are static samples. Nothing here comes from the C++ engine yet.
        </div>

        <h1 className="dash-title">Overview</h1>

        <section className="metrics">
          {metrics.map((m) => (
            <div key={m.label} className="card metric">
              <span className="muted metric-label">{m.label}</span>
              <span className="mono metric-value">{m.value}</span>
              {m.demo && <span className="badge badge-simulated tiny">demo</span>}
            </div>
          ))}
        </section>

        <section className="dash-grid">
          <div className="card">
            <h3>Order book</h3>
            <div className="book-two">
              <table className="table">
                <thead><tr><th>Qty</th><th>Bid</th></tr></thead>
                <tbody>
                  {BIDS.map(([p, q]) => <tr key={p}><td>{q}</td><td className="bid">{p.toFixed(2)}</td></tr>)}
                </tbody>
              </table>
              <table className="table">
                <thead><tr><th>Ask</th><th>Qty</th></tr></thead>
                <tbody>
                  {ASKS.map(([p, q]) => <tr key={p}><td className="ask">{p.toFixed(2)}</td><td>{q}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3>Replay controls</h3>
            <p>Planned: load an event file, step or run the replay, and compare book states.</p>
            <div className="controls">
              <button className="btn" disabled>Load events</button>
              <button className="btn" disabled>Step</button>
              <button className="btn btn-primary" disabled>Run</button>
            </div>
            <span className="badge badge-planned">planned</span>
          </div>

          <div className="card">
            <h3>Benchmarks</h3>
            <p className="empty">
              No measurements yet. Results will appear here once the engine exists and benchmarks
              have been run on a documented machine and configuration.
            </p>
          </div>

          <div className="card">
            <h3>Event log</h3>
            <ul className="log mono">
              {LOG.map((l, i) => (
                <li key={i}>
                  <span className="muted">{l.t}</span>{' '}
                  <span className={l.level === 'WARN' ? 'warn' : 'info'}>{l.level}</span> {l.msg}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}