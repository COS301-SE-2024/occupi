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
  const page = await browser.newPage()

  try {
    await page.goto('https://occupi.tech/')

    // scroll down to bottom of page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    // wait for 1 second
    sleep(1)

    // scroll back to top of page
    await page.evaluate(() => {
      window.scrollTo(0, 0)
    })

    // wait for 1 second
    sleep(1)

    // close the browser
    await browser.close()
  } catch (err) {
    console.error(err)
  }
}