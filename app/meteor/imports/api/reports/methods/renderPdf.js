import chromeRemote from 'chrome-remote-interface'
import delay from 'await-delay'
import { dayToSlug } from '../../../util/time/day'

// Paper size in Inches
const A4 = {
  width: 11.7,
  height: 8.3
}

const printToPDF = async ({ url, port, printOptions }) => {
  return new Promise((resolve, reject) => {
    chromeRemote({ port }, async client => {
      try {
        const { Page } = client
        await Page.enable()
        await Page.navigate({ url })
        await Page.loadEventFired()

        await delay(5000)

        const pdf = await Page.printToPDF(printOptions)
        const buffer = Buffer.from(pdf.data, 'base64')

        resolve(buffer)
      } catch (e) {
        reject(e)
      } finally {
        client.close()
      }
    })
  })
}

export const renderPdf = async ({ report }) => {
  const port = 9222
  const printOptions = {
    landscape: true,
    displayHeaderFooter: false,
    printBackground: true,
    paperWidth: A4.width,
    paperHeight: A4.height
  }

  const slug = dayToSlug(report.day)
  const url = `http://127.0.0.1:${process.env.PORT}/reports/${slug}`
  const pdf = await printToPDF({ url, port, printOptions })

  return pdf
}
