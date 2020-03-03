import { color, lightness } from 'kewler'

export const fontStack = `'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif`

export const background = '#ecf0f5'
export const lightBackground = '#f8f9f9'

export const mutedBackground = '#eef1f5'
export const lighterMutedBackground = '#e5e7eb'
export const darkerMutedBackground = '#d6d9df'
export const mutedSeparator = '#abb6ca'

export const primaryActive = '#357ca5'
export const primary = '#3c8dbc'
export const primaryDisabled = '#3c8dd7'

export const grayActive = '#b5bbc8'
export const gray = '#d2d6de'
export const grayDisabled = '#d2d6de'

export const darkGrayActive = '#6c717a'
export const darkGray = '#81868e'
export const darkGrayDisabled = '#9398a1'

export const sidebarBackground = '#222d31'
export const sidebarText = '#b8c7cd'

export const modalBackground = 'rgba(0,0,0,0.5)'

export const unavailable = '#C9CCD0'

export const green = '#8fc6ae'
export const red = '#e37067'

export const warning = '#f39c12'
export const warningBorder = '#c87f0a'

export const text = '#333'

export const fontSize = '16px'

const infoStyle = {
  borderRadius: '3px',
  paddingTop: 1,
  paddingRight: 12,
  paddingLeft: 12,
  paddingBottom: 1,
  display: 'inline-block',
  width: '100%'
}

export const highlightBackground = '#FFFBE6'
export const highlightColor = '#6E5221'

export const highlight = {
  ...infoStyle,
  backgroundColor: highlightBackground,
  border: '1px solid #FFF4C5',
  color: '#6E5221'
}

export const important = {
  ...infoStyle,
  backgroundColor: '#FFF0F0',
  border: '1px solid #FED6D7',
  color: '#FC2935'
}

export const lighten = (c, amount = 3) => {
  try {
    return color(c, lightness(amount))
  } catch (e) {
    console.error(e)
    return '#ccc'
  }
}
export const darken = (c, amount = -10) => lighten(c, amount)

// Read the csp-nonce meta tag set by browserPolicy.js
let styleNonce = null
const metaTag = document.head.querySelector('[property=csp-nonce][content]')
if (metaTag) {
  styleNonce = metaTag.content
} else {
  console.error('[styles] getStyleNonce: Could not find csp-nonce meta tag in head')
}
export const getStyleNonce = () => styleNonce
