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
    page.on('console', msg => console.log('[Reports] renderPdf [console]', msg.text))

    await page.goto(url, { waitUntil: 'networkidle2' })
    let loaded = false
    let retries = 0
    let html = ''
    do {
      await delay(2000)

      const aHandle = await page.evaluateHandle(() => document.body)
      const resultHandle = await page.evaluateHandle(body => body.innerHTML, aHandle)
      html = await resultHandle.jsonValue()
      await resultHandle.dispose()

      loaded = isLoaded(html)

      if (!loaded) {
        retries++
        console.log('[Reports] renderPdf: Still loading, retry', retries)
        if (retries > 10) {
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

export const renderPdf = async ({ day }) => {
  const slug = dayToSlug(day)
  const url = `http://127.0.0.1:${process.env.PORT}/reports/day/${slug}#print`
  const pdf = await printToPDF({ url, printOptions, isLoaded })

  return pdf
}
