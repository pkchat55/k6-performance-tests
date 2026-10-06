// Node script: reads k6 JSON output (results.json) and injects a response-time
// timeline chart (Chart.js) into the BlazeMeter style report.
const fs = require('fs');

const resultsFile = process.argv[2] || 'results.json';
const reportFile = process.argv[3] || 'blazemeter-report.html';

const lines = fs.readFileSync(resultsFile, 'utf-8').split('\n').filter(Boolean);

const points = [];
for (const line of lines) {
    let entry;
    try {
        entry = JSON.parse(line);
    } catch (e) {
        continue;
    }
    if (entry.type === 'Point' && entry.metric === 'http_req_duration') {
        points.push({
            time: entry.data.time,
            value: entry.data.value,
        });
    }
}

points.sort((a, b) => new Date(a.time) - new Date(b.time));

const startTime = points.length ? new Date(points[0].time).getTime() : 0;
const labels = points.map(p => ((new Date(p.time).getTime() - startTime) / 1000).toFixed(1));
const values = points.map(p => p.value.toFixed(0));

const chartHtml = `
<h1>Response Time Over Time</h1>
<canvas id="timelineChart" height="90"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    const ctx = document.getElementById('timelineChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ${JSON.stringify(labels)},
            datasets: [{
                label: 'Response Time (ms)',
                data: ${JSON.stringify(values)},
                borderColor: '#2d8cf0',
                backgroundColor: 'rgba(45,140,240,0.1)',
                fill: true,
                pointRadius: 0,
                borderWidth: 1.5,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Elapsed Time (s)' } },
                y: { title: { display: true, text: 'Response Time (ms)' }, beginAtZero: true }
            },
            plugins: { legend: { display: true } }
        }
    });
</script>
`;

let html = fs.readFileSync(reportFile, 'utf-8');
html = html.replace('</body>', `${chartHtml}\n</body>`);
fs.writeFileSync(reportFile, html);

console.log(`Injected timeline chart with ${points.length} data points into ${reportFile}`);
