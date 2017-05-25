import IntlPolyfill from 'intl'

export default () => {
  Intl.NumberFormat = IntlPolyfill.NumberFormat
  Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat
}
