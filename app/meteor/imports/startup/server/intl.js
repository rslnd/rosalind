import icu from 'full-icu'
import IntlPolyfill from 'intl'

export default () => {
  Intl.NumberFormat = IntlPolyfill.NumberFormat
  Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat

  console.log(icu)
}
