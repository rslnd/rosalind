const express = require('express')
const hsts = require('hsts')

const PORT = process.env.PORT || 8080
const app = express()

app.disable('x-powered-by')
app.use(hsts({
  maxAge: 63072000,
  includeSubDomains: true,
  preload: true
}))

app.get('/', (req, res) => {
  res.end('🦄\r\n')
})

app.listen(PORT, () =>
  console.log('Listening on port', PORT)
)
