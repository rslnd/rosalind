import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export const fillPlaceholders = async ({ base64, placeholders, values }) => {
  const pdf = await PDFDocument.load(base64)
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica)
  const pages = pdf.getPages()

  placeholders.forEach(p => {
    const page = pages[p.page]
    const text = values[p.value]

    if (page && text) {
      page.drawText(text, {
        x: p.x,
        y: p.y,
        size: p.fontSize,
        font: helvetica
      })
    }
  })

  const base64Filled = await pdf.saveAsBase64({ dataUri: true })
  return base64Filled
}
