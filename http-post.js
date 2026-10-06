import http from 'k6/http';
import { check } from 'k6';

export default function () {

    const body = JSON.stringify({
        username: 'test_' + Date.now(),
        password: 'test'
    });

    const params = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    http.post('https://test-api.k6.io/user/register/', body, params);

    let res = http.post(
        'https://test-api.k6.io/auth/token/login/',
        JSON.stringify(
            {
                username: 'test_737252937362251',
                password: 'test'
            }
        ),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    if (res.status !== 200) {
        console.error(`login failed, status ${res.status}, body: ${res.body}`);
        return;
    }

    const accessToken = res.json().access;
    console.log(accessToken);
}