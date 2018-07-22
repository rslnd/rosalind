var IntlPolyfill = require('intl')
Intl.NumberFormat = IntlPolyfill.NumberFormat
Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat

var chai = require('chai')

chai.use(require('chai-datetime'))

global.expect = chai.expect
