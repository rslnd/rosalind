import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QR from '@shortcm/qr-image'

export const fillPlaceholders = async ({ base64, placeholders, values }) => {
  const pdf = await PDFDocument.load(base64)
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const pages = pdf.getPages()

  for (let i = 0; i < placeholders.length; i++) {
    const p = placeholders[i]
    const page = pages[p.page]
    if (!page) { continue }

    const text = values[p.value]
    if (!text) { continue }

    if (p.qr) {
      const png = await QR.image(text, { type: 'png' })
      console.log('PNG', png)
      const qrcode = await pdf.embedPng(png)
      page.drawImage(qrcode, {
        x: p.x,
        y: p.y,
        width: p.fontSize,
        height: p.fontSize
      })
    } else {
      page.drawText(text, {
        x: p.x,
        y: p.y,
        size: p.fontSize,
        font: p.bold ? helveticaBold : helvetica
      })
    }
  }

  const base64Filled = await pdf.saveAsBase64({ dataUri: true })
  return base64Filled
}
