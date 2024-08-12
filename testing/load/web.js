import { browser } from 'k6/browser'
import { sleep } from 'k6';

export const options = {
  scenarios: {
    ui: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
  },
  cloud: {
    // Project: occupi tech stach
    projectID: 3708619,
    // Test runs with the same name groups test runs together.
    name: 'Test occupi tech landing page'
  }
};

export default async function() {
  const username = __ENV.USERNAME;
  const password = __ENV.PASSWORD;
  const testpassphrase = __ENV.PASSPHRASE;
  const page = await browser.newPage()

  try {
    await page.goto('https://dev.occupi.tech/')

    await page.locator('input[name="email"]').type(username)
    await page.locator('input[name="password"]').type(password)

    // locate button with id "LoginFormSubmitButton" and click it
    const submitButton = page.locator('#LoginFormSubmitButton')

    await Promise.all([page.waitForNavigation(), submitButton.click()])

    sleep(1)

  } catch (err) {
    console.error(err)
  }
}