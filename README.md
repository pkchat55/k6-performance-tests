# k6 Performance Testing Suite

[![k6](https://img.shields.io/badge/k6-Load%20Testing-7D64FF?logo=k6&logoColor=white)](https://k6.io/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Grafana](https://img.shields.io/badge/Reporting-Grafana%20Style-F46800?logo=grafana&logoColor=white)](https://grafana.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

A production-style **k6 performance testing suite** covering the full spectrum of API load-testing patterns: HTTP verbs, authentication flows, request correlation, data-driven testing, and custom HTML reporting (Grafana-style and BlazeMeter-style aggregate reports).

This repo is designed as both a **working test harness** and a **reference implementation** of k6 best practices — defensive response handling, reusable credential pools, and CI-friendly reporting.

---

## ✨ Highlights

- **Full HTTP verb coverage** — `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- **Auth & token flows** — register → login → bearer-token-authenticated requests
- **Request correlation** — chaining responses across dependent requests (create → read → update → delete)
- **Data-driven testing** — credential pools sourced from `JSON` and `CSV` via `SharedArray`
- **Resilient response handling** — guarded JSON parsing (`try/catch` + status/content-type checks) so a bad upstream response never crashes a VU
- **Custom reporting**
  - Native **k6 web dashboard** export (Grafana-style real-time charts)
  - **BlazeMeter-style** aggregate report (Avg / Median / p90 / p95 / p99 / Error % / Throughput) with an injected response-time timeline chart
- **Environment-variable driven configuration** for portable, multi-environment runs

---

## 📁 Project Structure

| File | Purpose |
|---|---|
| `http-get.js` | Basic `GET` request + JSON assertion |
| `http-post.js` / `http-post_coderefactor.js` | User registration + login (`POST`), token extraction |
| `http-post-Auth.js` | Full authenticated flow: register → login → create resource |
| `http-post_token_assignment.js` | End-to-end token lifecycle: register → login → authorized `GET`/`POST` → verification |
| `http-put.js` | Authenticated resource update (`PUT`) |
| `http-patch.js` | Authenticated partial update (`PATCH`) |
| `http-delete.js` | Full CRUD lifecycle ending in resource deletion |
| `accessingHeader.js` | Reading and asserting on response headers |
| `corelation.js` | Request correlation — using data from one response in the next request |
| `parsing-json.js` | JSON response parsing & field assertions |
| `random-item.js` | Random selection from a dynamic response dataset |
| `random-string.js` / `random-sleep.js` | Randomized test data & think-time simulation |
| `external-json.js` / `external-json-initial.js` | Data-driven testing using `users.json` + `SharedArray` |
| `external-csv.js` | Data-driven testing using `users.csv` + PapaParse |
| `env-var.js` | Environment-variable driven base URL configuration |
| `add-timeline.js` | Node.js post-processor that injects a response-time timeline chart into the HTML report |
| `users.json` / `users.csv` | Reusable test credential datasets |

---

## 🚀 Getting Started

### Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) (v0.49+ recommended for native web dashboard support)
- [Node.js](https://nodejs.org/) (only required for the timeline report post-processing step)

```bash
# macOS
brew install k6
```

### Run a single test

```bash
k6 run http-post_token_assignment.js
```

### Run with custom VUs / duration

```bash
k6 run --vus 5 --duration 30s random-string.js
```

### Run with environment variables

```bash
k6 run -e BASE_URL=https://your-api.example.com env-var.js
```

---

## 📊 Reporting

### Grafana-style live dashboard + HTML export

k6's native web dashboard renders real-time charts during the run and can export a full HTML report at the end:

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=grafana-report.html \
  k6 run --vus 3 --duration 40s env-var.js
```

### BlazeMeter-style aggregate report with timeline

Generates an aggregate summary table (Avg, Median, p90/p95/p99, Error %, Throughput, KB/sec) via `handleSummary`, then enriches it with a response-time timeline chart sourced from the raw JSON output:

```bash
k6 run --vus 3 --duration 15s --out json=results.json env-var.js
node add-timeline.js results.json blazemeter-report.html
```

Open `blazemeter-report.html` in a browser to view the final report.

---

## 🛡️ Defensive Response Handling

Every script that parses a response body guards against non-2xx / non-JSON responses before calling `res.json()`:

```js
if (res.status !== 200) {
    console.error(`request failed, status ${res.status}, body: ${res.body}`);
    return;
}
```

This prevents a single unexpected upstream response (maintenance page, redirect, rate-limit block, etc.) from throwing an unhandled `GoError` and aborting the iteration — keeping load tests stable and metrics trustworthy at scale.

---

## ⚠️ Target API Notice

These scripts were authored against the public [`test-api.k6.io`](https://test-api.k6.io) demo API. That service has since been retired in favor of [QuickPizza](https://quickpizza.grafana.com), Grafana's current k6 demo application. Point `BASE_URL` / request URLs at your own API (or QuickPizza) to get live, passing results — the test logic itself is API-agnostic.

---

## 🧰 Tech Stack

`k6` · `JavaScript (ES6+)` · `k6/http` · `k6/data` · `jslib.k6.io` (k6-utils, PapaParse) · `Node.js` (reporting) · `Chart.js` (timeline visualization)

---

## 📄 License

MIT — feel free to use this suite as a template for your own performance testing projects.
