import puppeteer from 'puppeteer'
import delay from 'await-delay'
import { dayToSlug } from '../../../util/time/day'

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

const isLoaded = (html = '') =>
  html.match(/weekPreviewLoaded/g)

const printToPDF = async ({ url, printOptions, isLoaded }) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()

    await page.goto(url, { waitUntil: 'networkidle' })

    let loaded = false
    let retries = 0
    do {
      await delay(2000)
      const html = await page.evaluate(() => document.body.innerHTML)
      loaded = isLoaded(html)

      if (!isLoaded) {
        retries++
        console.log('[Reports] renderPdf: Still loading, retry', retries)
        if (retries > 30) {
          console.error(html)
          throw new Error(`[Reports] renderPdf: Failed to load`)
        }
      }
    } while (!loaded)

    await delay(500)

    const buffer = await page.pdf(printOptions)

    return buffer
  } catch (e) {
    console.error('[Reports] renderPdf', e)
  } finally {
    await browser.close()
  }
}

export const renderPdf = async ({ report }) => {
  const slug = dayToSlug(report.day)
  const url = `http://127.0.0.1:${process.env.PORT}/reports/${slug}#print`
  const pdf = await printToPDF({ url, printOptions, isLoaded })

  return pdf
}
