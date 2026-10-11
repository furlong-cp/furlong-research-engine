# Architecture

Furlong Research Engine is a C++20 research project for exploring limit order books, replaying market events and testing execution logic. It is in early development.

## Repository layout

- `engine/` - C++20 core: order book, matching engine, market replay, tests (CMake + GoogleTest)
- `frontend/` - React + TypeScript website (landing page, login prototype, dashboard with demo data)
- `docs/` - architecture notes and development log

## Engine components

| Component | Responsibility |
|---|---|
| `order.hpp` | Order, Trade, Side and OrderType definitions. Prices are integer ticks, not floating point. |
| `order_book.hpp/.cpp` | Resting limit orders. Price priority across levels, time priority within a level. |
| `matching_engine.hpp/.cpp` | Matches incoming orders against the book. Trades execute at the resting order's price. |
| `market_event.hpp` | Event types: new order, cancel. |
| `market_replay.hpp/.cpp` | Feeds an ordered event list into a fresh engine and returns the trades. |

## Matching rules

- Buy orders match the lowest asks first; sell orders match the highest bids first.
- Within a price level, the earliest order fills first.
- A limit order's unfilled remainder rests in the book.
- A market order's unfilled remainder is discarded.

## Determinism

The engine uses no randomness, clocks or floating-point prices. The same event list always produces the same trades. This is covered by tests.

## Current status

- Implemented: order book, matching engine, replay, 14 passing tests
- Simulated: website order book preview and dashboard (demo data)
- Planned: benchmarks, profiling, execution simulation, backend API, real authentication

## Not yet implemented

No performance numbers are published because no benchmarks have been run yet.