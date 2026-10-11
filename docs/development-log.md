# Development log

## 2026-10-11

- Built the React + TypeScript frontend with three routes: landing page, login prototype, dashboard (demo data).
- Implemented the C++20 order book with price-time priority.
- Implemented the matching engine (limit and market orders, trades at maker price).
- Implemented deterministic market replay (new order and cancel events).
- Set up CMake and GoogleTest. 14 tests passing.

## Next

- Benchmark program with a documented machine and configuration
- Profiling
- Connect the dashboard to real engine output