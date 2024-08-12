import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '30s',
    cloud: {
        // Project: occupi tech stach
        projectID: 3708619,
        // Test runs with the same name groups test runs together.
        name: 'Test (10/08/2024-12:22:34)'
    }
};

export default function() {
    const username = __ENV.USERNAME;
    const password = __ENV.PASSWORD;
    const testpassphrase = __ENV.PASSPHRASE;

    const res = http.post('https://dev.occupi.tech/auth/login', {
        email: username,
        password: password,
        test: testpassphrase
    });

    // check response to make sure it was successful
    if (res.status !== 200) {
        console.log(`Error: ${res.status} ${res.body}`);
    }

    sleep(1);

    // logout
    http.post('https://dev.occupi.tech/auth/logout');
}