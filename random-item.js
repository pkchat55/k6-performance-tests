import http from 'k6/http';
import { check } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export default function () {
    let res = http.get('https://test-api.k6.io/public/crocodiles/');

    if (res.status !== 200 || !res.headers['Content-Type'] || !res.headers['Content-Type'].includes('application/json')) {
        console.error(`unexpected response, status ${res.status}, url ${res.url}, body: ${res.body}`);
        return;
    }

    const crocodiles = res.json();
    const crocodileIds = crocodiles.map(item => item.id);
    const crocodileId = randomItem(crocodileIds);

    res = http.get(`https://test-api.k6.io/public/crocodiles/${crocodileId}/`);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'crocodile has the correct id': (r) => r.json().id === crocodileId
    });
}