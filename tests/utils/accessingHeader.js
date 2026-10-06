import http from 'k6/http';
import { check } from 'k6';

export default function () {
    let res = http.get('https://test-api.k6.io/public/crocodiles/');

    if (res.status !== 200 || !res.headers['Content-Type'] || !res.headers['Content-Type'].includes('application/json')) {
        console.error(`unexpected response, status ${res.status}, url ${res.url}, body: ${res.body}`);
        return;
    }

    const crocodiles = res.json();
    const crocodileId = crocodiles[0].id;
    const crocodileName = crocodiles[0].name;

    res = http.get(`https://test-api.k6.io/public/crocodiles/${crocodileId}/`);

    console.log(res.headers.Allow);
    console.log(res.headers['Content-Type']);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'crocodile name': (r) => r.json().name === crocodileName
    });

}