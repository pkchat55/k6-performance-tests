import http from 'k6/http';
import { check } from 'k6';

export default function () {
    let res = http.get('https://httpbin.org/json');

    console.log(res.json().slideshow.author);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'Author is Yours Truly': (r) => r.json().slideshow.author === 'Yours Truly'
    });

}