import puppeteer from 'puppeteer'
import { dayToSlug } from '../../../util/time/day'
import { withTrustedAccessToken } from '../../../util/meteor/withTrustedAccessToken'

const printOptions = {
  format: 'A4',
  landscape: true,
  printBackground: true,
  margin: {
    top: '1.3cm',
    right: '1.3cm',
    bottom: '1.3cm',
    left: '1.3cm'
  }
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const printToPDF = async ({ url, printOptions }) => {
  const browser = await puppeteer.launch({
    headless: true, // Note: Only disable for debugging, pdf only renders in headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--no-default-browser-check',
      '--disable-bundled-ppapi-flash'
    ]
  })

  try {
    const page = await browser.newPage()

    // BUG: UNSAFE: Fix CSP
    await page.setBypassCSP(true)

    page.on('console', msg => console.log('[Reports] renderPdf [console]', msg.text()))

    let loaded = false
    let retries = 0

    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.exposeFunction('print', () => { loaded = true })

    do {
      await delay(2000)
      if (!loaded) {
        retries++
        console.log('[Reports] renderPdf: Still loading, retry', retries)
        if (retries > 15) {
          throw new Error(`[Reports] renderPdf: Failed to load`)
        }
      }
    } while (!loaded) // eslint-disable-line

    console.log('[Reports] renderPdf: Loaded, waiting 10s before rendering pdf')
    await delay(10000)

    console.log('[Reports] renderPdf: Rendering pdf')
    const buffer = await page.pdf(printOptions)
    console.log('[Reports] renderPdf: Rendered pdf')

    return buffer
  } catch (e) {
    console.error('[Reports] renderPdf', e)
  } finally {
    await browser.close()
  }
}

export const renderPdf = async ({ day }) => {
  const slug = dayToSlug(day)

  const pdf = withTrustedAccessToken(async accessToken => {
    const url = `http://localhost:${process.env.PORT}/reports/day/${slug}?accessToken=${accessToken}#print`
    return printToPDF({ url, printOptions })
  })

  return pdf
}
