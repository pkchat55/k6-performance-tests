import http from 'k6/http';

export const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

export default function () {

    http.get(`${__ENV.BASE_URL}/public/crocodiles/`);
}

export function handleSummary(data) {
    return {
        'blazemeter-report.html': blazeMeterReport(data),
    };
}

function blazeMeterReport(data) {
    const dur = data.metrics.http_req_duration.values;
    const reqs = data.metrics.http_reqs.values;
    const failed = data.metrics.http_req_failed ? data.metrics.http_req_failed.values.rate : 0;
    const dataRecv = data.metrics.data_received ? data.metrics.data_received.values.count : 0;
    const durationSec = data.state.testRunDurationMs / 1000;
    const throughput = reqs.count / durationSec;
    const kbSec = (dataRecv / 1024) / durationSec;

    const row = {
        label: 'All Requests',
        samples: reqs.count,
        avg: dur.avg.toFixed(0),
        min: dur.min.toFixed(0),
        max: dur.max.toFixed(0),
        median: dur.med.toFixed(0),
        p90: dur['p(90)'].toFixed(0),
        p95: dur['p(95)'].toFixed(0),
        p99: dur['p(99)'] ? dur['p(99)'].toFixed(0) : 'n/a',
        errorPct: (failed * 100).toFixed(2),
        throughput: throughput.toFixed(2),
        kbSec: kbSec.toFixed(2),
    };

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>BlazeMeter Style Aggregate Report</title>
<style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    th { background: #2d3e50; color: #fff; padding: 10px; text-align: center; font-size: 13px; }
    td { padding: 10px; text-align: center; border-bottom: 1px solid #ddd; font-size: 13px; }
    tr:hover { background: #f1f8ff; }
    .error { color: ${row.errorPct > 0 ? '#d9534f' : '#5cb85c'}; font-weight: bold; }
</style>
</head>
<body>
<h1>Aggregate Report</h1>
<table>
    <tr>
        <th>Label</th>
        <th>#Samples</th>
        <th>Average (ms)</th>
        <th>Median (ms)</th>
        <th>90th pct</th>
        <th>95th pct</th>
        <th>99th pct</th>
        <th>Min (ms)</th>
        <th>Max (ms)</th>
        <th>Error %</th>
        <th>Throughput (req/s)</th>
        <th>KB/sec</th>
    </tr>
    <tr>
        <td>${row.label}</td>
        <td>${row.samples}</td>
        <td>${row.avg}</td>
        <td>${row.median}</td>
        <td>${row.p90}</td>
        <td>${row.p95}</td>
        <td>${row.p99}</td>
        <td>${row.min}</td>
        <td>${row.max}</td>
        <td class="error">${row.errorPct}%</td>
        <td>${row.throughput}</td>
        <td>${row.kbSec}</td>
    </tr>
</table>
</body>
</html>
`;
}