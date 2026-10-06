import http from 'k6/http';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { check } from 'k6';
import { SharedArray } from 'k6/data';

const userCredentials = new SharedArray('users with credentials', function () {
    return JSON.parse(open('../../data/users.json')).users;
});

export default function () {

    const randomCredential = randomItem(userCredentials);

    let res = http.post(
        'https://test-api.k6.io/auth/token/login/',
        JSON.stringify(
            {
                username: randomCredential.username,
                password: randomCredential.password
            }
        ),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    // Parse the JSON body once and reuse it, instead of calling res.json()
    // repeatedly (each call re-parses the whole body, wasting CPU under load).
    // Wrap in try/catch so a non-JSON response (e.g. an error page) doesn't
    // crash the whole VU/iteration.
    let body = null;
    try {
        body = res.json();
    } catch (e) {
        body = null;
    }

    const loginOk = res.status === 200 && body !== null && body.access !== undefined;

    check(res, {
        'status is 200': (r) => r.status === 200,
        'has access token': () => loginOk
    });

    if (!loginOk) {
        console.error(`login failed, status ${res.status}, body: ${res.body}`);
        return;
    }

    const accessToken = body.access;
}

