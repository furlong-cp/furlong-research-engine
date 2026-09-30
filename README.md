# Furlong Research Engine

> **Low-latency market replay and execution research engine built in C++20.**

Furlong Research Engine is a performance-focused research infrastructure project for studying **market microstructure, order-book dynamics, realistic execution, latency, and low-latency trading systems**.

The engine is designed to replay market events deterministically, simulate order execution under configurable market conditions, and analyze how factors such as **queue position, latency, slippage, and order flow** affect execution outcomes.

## Core Focus

* **Limit Order Book** — Price-time priority matching and order management
* **Market Replay** — Deterministic replay of historical market events
* **Execution Simulation** — Partial fills, queue position, latency and slippage
* **Strategy Research** — Pluggable strategy interface for systematic experiments
* **Performance Engineering** — Throughput, latency distributions, memory and CPU profiling
* **Execution Forensics** — Analyze why orders filled, partially filled, or remained unfilled

## Architecture

```text
Market Data
     │
     ▼
Event Replay
     │
     ▼
Order Book
     │
     ├──────────────► Strategy
     │                   │
     ▼                   ▼
Execution Simulator ◄────┘
     │
     ▼
Research & Analytics
```

## Technology

```text
C++20        Core Engine
CMake        Build System
GoogleTest   Testing
Python       Research & Analysis
pybind11     Python Bindings
Linux perf   Performance Profiling
React        Visualization
```

## Research Areas

```text
Market Microstructure
Order Book Dynamics
Queue Position
Execution Probability
Latency Sensitivity
Low-Latency Systems
Performance Optimization
Trading Infrastructure
```

## Status

🚧 **Early Development**

The project is being developed incrementally, beginning with the core order-book and matching-engine infrastructure.

## Author

**Ganesh Shanbhag**

Mathematics & Computing @ NIT Warangal
Data Science & AI @ IIT Guwahati

Interested in **Quantitative Trading, HFT, Competitive Programming, Low-Latency Systems, Algorithms, and Market Microstructure.**

---

> **Copyright © 2026 Ganesh Shanbhag. All rights reserved.**
>
> This repository is publicly available for viewing and evaluation. No permission is granted to copy, modify, distribute, sublicense, or commercially use the source code without prior written permission.
