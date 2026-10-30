// The body is globally zoomed (client/css/layout.css: body { zoom: 1.221 }).
// getBoundingClientRect() returns visual (zoomed) pixels, but top/left/translate
// set on an element inside the body are multiplied by the zoom again, so
// popovers positioned from measured rects end up offset. Divide by the
// factor returned here before using a measured rect as a CSS length.
//
// Measured with a probe instead of reading `zoom`, because browsers with the
// legacy (non-standard) zoom implementation do not need the correction.
let cached = null

export const bodyZoom = () => {
  if (cached) { return cached }
  if (typeof document === 'undefined' || !document.body) { return 1 }

  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;visibility:hidden;left:100px;top:0;width:0;height:0'
  document.body.appendChild(probe)
  const factor = (probe.getBoundingClientRect().left - document.documentElement.getBoundingClientRect().left) / 100
  document.body.removeChild(probe)

  cached = factor > 0 ? factor : 1
  return cached
}

export const unzoom = px => px / bodyZoom()
