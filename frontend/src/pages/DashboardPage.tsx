import { useState } from 'react'
import Sidebar, { type TerminalTab } from '../components/terminal/Sidebar'
import Topbar from '../components/terminal/Topbar'
import './DashboardPage.css'

type Stock = {
  symbol: string
  name: string
  price: number
  change: number
}

type Holding = {
  symbol: string
  quantity: number
  average: number
}

type Experiment = {
  id: number
  name: string
  strategy: string
  horizon: string
  runs: number
  status: string
}

type LogEntry = {
  time: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}

const INITIAL_STOCKS: Stock[] = [
  { symbol: 'NVDA', name: 'NVIDIA', price: 183.22, change: 2.41 },
  { symbol: 'AAPL', name: 'Apple', price: 245.5, change: 0.82 },
  { symbol: 'MSFT', name: 'Microsoft', price: 512.8, change: -0.36 },
  { symbol: 'GOOGL', name: 'Alphabet', price: 241.15, change: 1.24 },
  { symbol: 'AMZN', name: 'Amazon', price: 228.4, change: -0.71 },
  { symbol: 'META', name: 'Meta Platforms', price: 711.3, change: 1.05 },
  { symbol: 'TSLA', name: 'Tesla', price: 325.7, change: -1.32 },
]


const INITIAL_LOGS: LogEntry[] = [
  { time: '09:00:00', level: 'INFO', message: 'Research terminal initialized.' },
  { time: '09:00:01', level: 'WARN', message: 'Live market data provider is not connected.' },
  { time: '09:00:02', level: 'INFO', message: 'Illustrative instrument universe loaded.' },
]

const money = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const number = (value: number) =>
  value.toLocaleString('en-US', { maximumFractionDigits: 2 })

function SectionTitle({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string
  title: string
  detail: string
}) {
  return (
    <div className="module-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      <p className="muted">{detail}</p>
    </div>
  )
}

function EmptyState({ children }: { children: string }) {
  return <p className="empty">{children}</p>
}

export default function DashboardPage() {
  const [active, setActive] = useState<TerminalTab>('Overview')
  const [stocks] = useState<Stock[]>(INITIAL_STOCKS)
  const [watchlist, setWatchlist] = useState(['NVDA', 'AAPL', 'MSFT'])
  const [selected, setSelected] = useState('NVDA')
  const [search, setSearch] = useState('')
  const [marketFilter, setMarketFilter] = useState('All')
  const [newSymbol, setNewSymbol] = useState('')

  const [holdings, setHoldings] = useState<Holding[]>([
    { symbol: 'NVDA', quantity: 10, average: 170 },
    { symbol: 'AAPL', quantity: 5, average: 230 },
  ])
  const [holdingSymbol, setHoldingSymbol] = useState('MSFT')
  const [holdingQuantity, setHoldingQuantity] = useState('1')
  const [holdingAverage, setHoldingAverage] = useState('100')

  const [researchSymbol, setResearchSymbol] = useState('NVDA')
  const [horizon, setHorizon] = useState('5 trading days')
  const [hypothesis, setHypothesis] = useState('')
  const [savedResearch, setSavedResearch] = useState<string[]>([])

  const [experimentName, setExperimentName] = useState('')
  const [strategy, setStrategy] = useState('Moving average crossover')
  const [experimentHorizon, setExperimentHorizon] = useState('30 days')
  const [experiments, setExperiments] = useState<Experiment[]>([])

  const [benchmarkRuns, setBenchmarkRuns] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)
  const [logFilter, setLogFilter] = useState('ALL')

  const stockFor = (symbol: string) =>
    stocks.find((stock) => stock.symbol === symbol)

  const selectedStock = stockFor(selected) ?? stocks[0]

  const recordLog = (level: LogEntry['level'], message: string) => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false })
    setLogs((previous) => [
      { time, level, message },
      ...previous,
    ])
  }

  const addToWatchlist = () => {
    const symbol = newSymbol.trim().toUpperCase()
    if (!symbol) return

    if (!stockFor(symbol)) {
      recordLog('WARN', `Unknown symbol ${symbol}; not in the demo universe.`)
      return
    }

    if (watchlist.includes(symbol)) {
      recordLog('INFO', `${symbol} is already in the watchlist.`)
      return
    }

    setWatchlist((previous) => [...previous, symbol])
    setSelected(symbol)
    setNewSymbol('')
    recordLog('INFO', `${symbol} added to watchlist.`)
  }

  const addHolding = () => {
    const quantity = Number(holdingQuantity)
    const average = Number(holdingAverage)

    if (
      !stockFor(holdingSymbol) ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(average) ||
      quantity <= 0 ||
      average <= 0
    ) {
      recordLog('WARN', 'Holding not added: check symbol, quantity and average price.')
      return
    }

    setHoldings((previous) => [
      ...previous,
      { symbol: holdingSymbol, quantity, average },
    ])
    recordLog('INFO', `Demo holding added: ${holdingQuantity} ${holdingSymbol}.`)
  }

  const saveResearch = () => {
    if (!hypothesis.trim()) return
    setSavedResearch((previous) => [
      `${researchSymbol} · ${horizon} · ${hypothesis.trim()}`,
      ...previous,
    ])
    recordLog('INFO', `Research hypothesis saved for ${researchSymbol}.`)
    setHypothesis('')
  }

  const createExperiment = () => {
    if (!experimentName.trim()) return

    const experiment: Experiment = {
      id: Date.now(),
      name: experimentName.trim(),
      strategy,
      horizon: experimentHorizon,
      runs: 0,
      status: 'CREATED',
    }

    setExperiments((previous) => [experiment, ...previous])
    setExperimentName('')
    recordLog('INFO', `Experiment created: ${experiment.name}.`)
  }

  const runExperiment = (id: number) => {
    setExperiments((previous) =>
      previous.map((experiment) =>
        experiment.id === id
          ? { ...experiment, runs: experiment.runs + 1, status: 'DEMO RUN COMPLETE' }
          : experiment,
      ),
    )
    recordLog('INFO', 'A simulated experiment run was recorded.')
  }

  const runBenchmark = () => {
    setBenchmarkRuns((previous) => previous + 1)
    recordLog('INFO', 'Illustrative frontend benchmark completed; not an engine benchmark.')
  }

  const matchingStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
      stock.name.toLowerCase().includes(search.toLowerCase())

    const matchesMovement =
      marketFilter === 'All' ||
      (marketFilter === 'Positive' && stock.change >= 0) ||
      (marketFilter === 'Negative' && stock.change < 0)

    return matchesSearch && matchesMovement
  })

  const portfolioValue = holdings.reduce((total, holding) => {
    return total + (stockFor(holding.symbol)?.price ?? 0) * holding.quantity
  }, 0)

  const portfolioCost = holdings.reduce(
    (total, holding) => total + holding.average * holding.quantity,
    0,
  )

  const visibleLogs = logs.filter(
    (log) => logFilter === 'ALL' || log.level === logFilter,
  )

  return (
    
<div className="terminal-shell">
  <Sidebar
    activeTab={active}
    onTabChange={setActive}
  />

  <main className="terminal-main">
    <Topbar
      activeTab={active}
      onSearch={setSearch}
    />

    <div className="terminal-page-content">

        <div className="demo-banner" role="status">
          <span className="badge badge-simulated">DEMO MODE</span>
          All quotes are illustrative. Portfolio figures use sample prices.
          No live feed, trading execution or validated forecast is connected.
        </div>

        {active === 'Overview' && (
          <>
            <section className="metrics">
              <div className="card metric">
                <span className="muted metric-label">Instruments available</span>
                <span className="mono metric-value">{stocks.length}</span>
                <span className="tiny muted">Demo universe</span>
              </div>
              <div className="card metric">
                <span className="muted metric-label">Watchlist</span>
                <span className="mono metric-value">{watchlist.length}</span>
                <span className="tiny muted">Tracked locally</span>
              </div>
              <div className="card metric">
                <span className="muted metric-label">Research notes</span>
                <span className="mono metric-value">{savedResearch.length}</span>
                <span className="tiny muted">Current session</span>
              </div>
              <div className="card metric">
                <span className="muted metric-label">Engine</span>
                <span className="mono metric-value status-text">OFFLINE</span>
                <span className="tiny muted">Backend not connected</span>
              </div>
            </section>

            <section className="terminal-section">
              <SectionTitle
                eyebrow="01 / MARKET MONITOR"
                title="Market snapshot"
                detail="Illustrative price and percentage-change values."
              />
              <div className="card table-card">
                <div className="table-scroll">
                  <table className="table market-table">
                    <thead>
                      <tr><th>Symbol</th><th>Price</th><th>Change</th><th>Feed</th></tr>
                    </thead>
                    <tbody>
                      {stocks.slice(0, 5).map((stock) => (
                        <tr key={stock.symbol} onClick={() => { setSelected(stock.symbol); setActive('Markets') }}>
                          <td><strong>{stock.symbol}</strong><span className="stock-name">{stock.name}</span></td>
                          <td className="mono">{money(stock.price)}</td>
                          <td className={stock.change >= 0 ? 'positive mono' : 'negative mono'}>
                            {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                          </td>
                          <td><span className="source-tag">SIMULATED</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="terminal-grid">
              <div className="card terminal-panel">
                <div className="eyebrow">SYSTEM / HEALTH</div>
                <h2>Connection status</h2>
                <div className="pipeline-row"><span>Market data</span><span className="pipeline-off">OFFLINE</span></div>
                <div className="pipeline-row"><span>Research backend</span><span className="pipeline-off">OFFLINE</span></div>
                <div className="pipeline-row"><span>Execution gateway</span><span className="pipeline-off">NOT CONFIGURED</span></div>
              </div>
              <div className="card terminal-panel">
                <div className="eyebrow">SYSTEM / ACTIVITY</div>
                <h2>Recent events</h2>
                {logs.slice(0, 4).map((log, i) => (
                  <div className="pipeline-row" key={`${log.time}-${i}`}>
                    <span>{log.message}</span>
                    <span className="pipeline-off">{log.level}</span>
                  </div>
                ))}
                <button className="btn" onClick={() => setActive('Logs')}>Open all logs</button>
              </div>
            </section>
          </>
        )}

        {active === 'Markets' && (
          <>
            <SectionTitle eyebrow="02 / INSTRUMENT UNIVERSE" title="Markets" detail="Browse and inspect the available sample instruments." />
            <div className="controls">
              <input className="terminal-input" placeholder="Search symbol or company" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="terminal-input" value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)}>
                <option>All</option><option>Positive</option><option>Negative</option>
              </select>
            </div>
            <div className="terminal-grid">
              <div className="card table-card">
                <div className="table-scroll">
                  <table className="table market-table">
                    <thead><tr><th>Symbol</th><th>Price</th><th>Change</th></tr></thead>
                    <tbody>
                      {matchingStocks.map((stock) => (
                        <tr key={stock.symbol} className={selected === stock.symbol ? 'selected-row' : ''} onClick={() => setSelected(stock.symbol)}>
                          <td><strong>{stock.symbol}</strong><span className="stock-name">{stock.name}</span></td>
                          <td className="mono">{money(stock.price)}</td>
                          <td className={stock.change >= 0 ? 'positive' : 'negative'}>{stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card terminal-panel">
                <div className="eyebrow">SELECTED INSTRUMENT</div>
                <h2>{selectedStock.symbol}</h2>
                <p className="muted">{selectedStock.name}</p>
                <div className="instrument-price mono">{money(selectedStock.price)}</div>
                <p className={selectedStock.change >= 0 ? 'positive' : 'negative'}>
                  {selectedStock.change > 0 ? '+' : ''}{selectedStock.change.toFixed(2)}%
                </p>
                <div className="chart-placeholder"><span>Historical price chart awaits a data source.</span></div>
                <h3>Sample order book</h3>
                <div className="pipeline-row"><span>Best bid</span><strong className="positive mono">{money(selectedStock.price - 0.01)}</strong></div>
                <div className="pipeline-row"><span>Best ask</span><strong className="negative mono">{money(selectedStock.price + 0.01)}</strong></div>
                <div className="pipeline-row"><span>Spread</span><span className="mono">$0.02</span></div>
                <button className="btn btn-primary" onClick={() => {
                  if (!watchlist.includes(selectedStock.symbol)) setWatchlist((previous) => [...previous, selectedStock.symbol])
                  recordLog('INFO', `${selectedStock.symbol} added to watchlist from Markets.`)
                }}>Add to watchlist</button>
              </div>
            </div>
          </>
        )}

        {active === 'Watchlist' && (
          <>
            <SectionTitle eyebrow="03 / PERSONAL UNIVERSE" title="Watchlist" detail="Manage symbols to monitor during this browser session." />
            <div className="controls">
              <input className="terminal-input" placeholder="Symbol, e.g. META" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addToWatchlist() }} />
              <button className="btn btn-primary" onClick={addToWatchlist}>Add symbol</button>
            </div>
            <div className="card table-card">
              <div className="table-scroll">
                <table className="table market-table">
                  <thead><tr><th>Symbol</th><th>Price</th><th>Change</th><th>Action</th></tr></thead>
                  <tbody>
                    {watchlist.map((symbol) => {
                      const stock = stockFor(symbol)
                      if (!stock) return null
                      return (
                        <tr key={symbol}>
                          <td><strong>{symbol}</strong><span className="stock-name">{stock.name}</span></td>
                          <td className="mono">{money(stock.price)}</td>
                          <td className={stock.change >= 0 ? 'positive' : 'negative'}>{stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%</td>
                          <td><button className="btn" onClick={() => { setWatchlist((previous) => previous.filter((s) => s !== symbol)); recordLog('INFO', `${symbol} removed from watchlist.`) }}>Remove</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {watchlist.length === 0 && <EmptyState>Your watchlist is empty. Add a symbol from the demo universe.</EmptyState>}
            </div>
          </>
        )}

        {active === 'Research' && (
          <>
            <SectionTitle eyebrow="04 / QUANTITATIVE ANALYSIS" title="Research workspace" detail="Document hypotheses and define a testable research question." />
            <div className="terminal-grid">
              <div className="card terminal-panel">
                <h2>New research note</h2>
                <label className="field-label">Instrument</label>
                <select className="terminal-input full-input" value={researchSymbol} onChange={(e) => setResearchSymbol(e.target.value)}>
                  {stocks.map((stock) => <option key={stock.symbol} value={stock.symbol}>{stock.symbol} — {stock.name}</option>)}
                </select>
                <label className="field-label">Evaluation horizon</label>
                <select className="terminal-input full-input" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                  <option>1 trading day</option><option>5 trading days</option><option>20 trading days</option><option>60 trading days</option>
                </select>
                <label className="field-label">Hypothesis / question</label>
                <textarea className="terminal-input full-input research-textarea" placeholder="Example: Does recent volatility help explain next-week returns?" value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} />
                <button className="btn btn-primary" disabled={!hypothesis.trim()} onClick={saveResearch}>Save hypothesis</button>
                <p className="muted panel-note">Saving records a note only. It does not produce a forecast or validate the hypothesis.</p>
              </div>
              <div className="card terminal-panel">
                <h2>Research notes</h2>
                {savedResearch.length === 0 && <EmptyState>No research notes yet. Write a hypothesis to begin.</EmptyState>}
                {savedResearch.map((note, i) => <div className="pipeline-row" key={`${note}-${i}`}><span>{note}</span><span className="source-tag">NOTE</span></div>)}
              </div>
            </div>
          </>
        )}

        {active === 'Portfolio' && (
          <>
            <SectionTitle eyebrow="05 / POSITION MONITOR" title="Portfolio" detail="Track illustrative holdings; values are not linked to a brokerage." />
            <section className="metrics">
              <div className="card metric"><span className="muted metric-label">Sample market value</span><span className="mono metric-value">{money(portfolioValue)}</span></div>
              <div className="card metric"><span className="muted metric-label">Sample cost basis</span><span className="mono metric-value">{money(portfolioCost)}</span></div>
              <div className="card metric"><span className="muted metric-label">Unrealized difference</span><span className={`mono metric-value ${portfolioValue >= portfolioCost ? 'positive' : 'negative'}`}>{money(portfolioValue - portfolioCost)}</span></div>
              <div className="card metric"><span className="muted metric-label">Positions</span><span className="mono metric-value">{holdings.length}</span></div>
            </section>
            <div className="card terminal-panel">
              <h2>Add a demo position</h2>
              <div className="controls">
                <select className="terminal-input" value={holdingSymbol} onChange={(e) => setHoldingSymbol(e.target.value)}>
                  {stocks.map((stock) => <option key={stock.symbol} value={stock.symbol}>{stock.symbol}</option>)}
                </select>
                <input className="terminal-input" type="number" min="0.0001" step="any" aria-label="Quantity" placeholder="Quantity" value={holdingQuantity} onChange={(e) => setHoldingQuantity(e.target.value)} />
                <input className="terminal-input" type="number" min="0.01" step="any" aria-label="Average purchase price" placeholder="Average price" value={holdingAverage} onChange={(e) => setHoldingAverage(e.target.value)} />
                <button className="btn btn-primary" onClick={addHolding}>Add position</button>
              </div>
            </div>
            <div className="card table-card">
              <div className="table-scroll">
                <table className="table market-table">
                  <thead><tr><th>Symbol</th><th>Quantity</th><th>Average</th><th>Sample price</th><th>Market value</th><th>Difference</th><th>Action</th></tr></thead>
                  <tbody>
                    {holdings.map((holding, i) => {
                      const price = stockFor(holding.symbol)?.price ?? 0
                      const value = price * holding.quantity
                      const difference = (price - holding.average) * holding.quantity
                      return <tr key={`${holding.symbol}-${i}`}>
                        <td><strong>{holding.symbol}</strong></td><td className="mono">{number(holding.quantity)}</td><td className="mono">{money(holding.average)}</td><td className="mono">{money(price)}</td><td className="mono">{money(value)}</td>
                        <td className={difference >= 0 ? 'positive mono' : 'negative mono'}>{money(difference)}</td>
                        <td><button className="btn" onClick={() => setHoldings((previous) => previous.filter((_, index) => index !== i))}>Remove</button></td>
                      </tr>
                    })}
                  </tbody>
                </table>
              </div>
              {holdings.length === 0 && <EmptyState>No positions yet. Add a demo position above.</EmptyState>}
            </div>
          </>
        )}

        {active === 'Experiments' && (
          <>
            <SectionTitle eyebrow="06 / MODEL DEVELOPMENT" title="Experiments" detail="Organize research runs and keep a basic experiment history." />
            <div className="card terminal-panel">
              <h2>Create experiment</h2>
              <div className="controls">
                <input className="terminal-input" placeholder="Experiment name" value={experimentName} onChange={(e) => setExperimentName(e.target.value)} />
                <select className="terminal-input" value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                  <option>Moving average crossover</option><option>Mean reversion</option><option>Momentum</option><option>Volatility study</option>
                </select>
                <select className="terminal-input" value={experimentHorizon} onChange={(e) => setExperimentHorizon(e.target.value)}>
                  <option>5 days</option><option>30 days</option><option>90 days</option><option>1 year</option>
                </select>
                <button className="btn btn-primary" disabled={!experimentName.trim()} onClick={createExperiment}>Create</button>
              </div>
            </div>
            <div className="news-list">
              {experiments.map((experiment) => (
                <article className="card news-item" key={experiment.id}>
                  <span className="news-index mono">E{experiment.id.toString().slice(-4)}</span>
                  <div>
                    <h3>{experiment.name}</h3>
                    <p className="muted">{experiment.strategy} · {experiment.horizon}</p>
                    <div className="pipeline-row"><span>Status</span><span className="source-tag">{experiment.status}</span></div>
                    <div className="pipeline-row"><span>Recorded runs</span><span className="mono">{experiment.runs}</span></div>
                    <button className="btn btn-primary" onClick={() => runExperiment(experiment.id)}>Record demo run</button>
                  </div>
                </article>
              ))}
              {experiments.length === 0 && <EmptyState>No experiments yet. Create one to start an experiment log.</EmptyState>}
            </div>
          </>
        )}

        {active === 'Benchmarks' && (
          <>
            <SectionTitle eyebrow="07 / PERFORMANCE LAB" title="Benchmarks" detail="A prototype interface for recording benchmark runs." />
            <div className="terminal-grid">
              <div className="card terminal-panel">
                <h2>Benchmark runner</h2>
                <p className="muted">Record a demo run to test the interface. These measurements are not actual CPU, C++ engine, exchange, or market-data performance measurements.</p>
                <button className="btn btn-primary" onClick={runBenchmark}>Record demo benchmark</button>
                <div className="instrument-price mono">{benchmarkRuns}</div>
                <span className="muted">Demo runs recorded this session</span>
              </div>
              <div className="card terminal-panel">
                <h2>Measurement protocol</h2>
                <div className="pipeline-row"><span>Machine configuration</span><span className="pipeline-off">NOT RECORDED</span></div>
                <div className="pipeline-row"><span>Workload and dataset</span><span className="pipeline-off">NOT CONFIGURED</span></div>
                <div className="pipeline-row"><span>Latency distribution</span><span className="pipeline-off">NO MEASUREMENTS</span></div>
                <div className="pipeline-row"><span>Repeatability</span><span className="pipeline-off">NOT VALIDATED</span></div>
              </div>
            </div>
          </>
        )}

        {active === 'Logs' && (
          <>
            <SectionTitle eyebrow="08 / OBSERVABILITY" title="Event logs" detail="Review local UI events and prototype warnings." />
            <div className="controls">
              <select className="terminal-input" value={logFilter} onChange={(e) => setLogFilter(e.target.value)}>
                <option value="ALL">All severity levels</option><option value="INFO">Info</option><option value="WARN">Warnings</option><option value="ERROR">Errors</option>
              </select>
              <button className="btn" onClick={() => setLogs([])}>Clear logs</button>
              <button className="btn" onClick={() => { setLogs(INITIAL_LOGS); }}>Restore startup logs</button>
            </div>
            <div className="card table-card">
              <div className="table-scroll">
                <table className="table market-table">
                  <thead><tr><th>Local time</th><th>Severity</th><th>Event</th></tr></thead>
                  <tbody>
                    {visibleLogs.map((log, i) => <tr key={`${log.time}-${i}`}>
                      <td className="mono">{log.time}</td>
                      <td className={log.level === 'ERROR' ? 'negative' : log.level === 'WARN' ? 'log-warn' : 'positive'}>{log.level}</td>
                      <td>{log.message}</td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
              {visibleLogs.length === 0 && <EmptyState>No events match this filter.</EmptyState>}
            </div>
          </>
        )}

        <footer className="terminal-footer mono">
          FURLONG RESEARCH ENGINE <span>·</span> PROTOTYPE <span>·</span> NO LIVE MARKET DATA
        </footer>

    </div>
  </main>
</div>
  )
}