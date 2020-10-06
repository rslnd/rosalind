import React, { useState, useRef, useEffect } from 'react'

// Lazy load huge pdfjs library
const pdfjsUrl = window.origin + '/pdf.min.js'
let pdfjs = window.pdfjsLib

export const PDFViewer = ({ pdf }) => {
  const [page, setPage] = useState(null)
  const [pages, setPages] = useState(null)
  const [scale, setScale] = useState(0.7)
  const [rendering, setRendering] = useState(false)
  const canvasRef = useRef()

  useEffect(() => {
    const immediateFn = async () => {
      if (!pdfjs || !pdf) { return }
      if (rendering) { return }

      setRendering(true)
      const urlPrefix = 'data:application/pdf;base64,'
      const stripped = pdf.replace(urlPrefix, '')

      window._b64 = stripped
      const doc = await pdfjs.getDocument({ data: window.atob(stripped) }).promise
      window._d = doc

      const pages = doc.numPages
      setPages(pages)
      const currentPage = await doc.getPage(page)
      const viewport = currentPage.getViewport({ scale })
      canvasRef.current.width = viewport.width
      canvasRef.current.height = viewport.height
      await currentPage.render({
        viewport,
        canvasContext: canvasRef.current.getContext('2d')
      }).promise
      setRendering(false)
    }
    immediateFn() // can't return promise directly to useEffect, as it's for cleanup only
  }, [pdf, page, scale])

  // installs global: window.pdfjsLib
  if (!pdfjs) {
    const asyncScript = document.createElement('script')
    asyncScript.src = pdfjsUrl
    asyncScript.onload = () => {
      console.log('[PDFViewer] loaded window.pdfjsLib')
      pdfjs = window.pdfjsLib
      setPage(1) // signal readiness
    }
    document.body.appendChild(asyncScript)

    return <span>Loading PDF Viewer...</span>
  }

  if (!pdf) {
    return 'Empty PDF'
  }

  const hasNext = page < pages
  const hasPrev = page > 1
  const handlePrev = (e) => { e.preventDefault(); setPage(page - 1) }
  const handleNext = (e) => { e.preventDefault(); setPage(page + 1) }
  const handleScale = (e) => setScale(parseFloat(e.target.value) / 100)

  return <div>
    <span>
      {
        hasPrev
        ? <a href='#' onClick={handlePrev}>&lt; Prev</a>
        : <span>&lt; Prev</span>
      }

      &emsp;
      Page {page} of {pages}
      &emsp;

      {
        hasNext
        ? <a href='#' onClick={handleNext}>Next &gt;</a>
        : <span>Next &gt;</span>
      }

      &emsp;
      &emsp;
      <input value={scale * 100} onChange={handleScale} style={{ width: 40 }} />&nbsp;%
    </span>
    <canvas ref={canvasRef} />
  </div>
}
