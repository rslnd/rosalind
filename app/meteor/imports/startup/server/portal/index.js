import { WebApp } from 'meteor/webapp'
import parse from 'co-body'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { ContactForm, handleContactForm } from './contactForm'
import { getBookables, handleAppointmentBooking } from './appointmentBooking'
import { portalCss } from './portalCss'

const ErrorMessage = () =>
  <div>
    <h2>Entschuldigung!</h2>
    <p>
      Es ist ein technischer Fehler aufgetreten. Bitte versuchen Sie es später noch ein Mal, oder kontaktieren Sie uns telefonisch.
    </p>
    <p>Vielen Dank</p>
  </div>

const respondWith = (res, Component) => {
  const rendered = ReactDOMServer.renderToString(<Component />)
    html = `<!DOCTYPE html>
<html>
  <head>
    <style>${portalCss}</style>
  </head>
  <body>
    <div id="portal">${rendered}</div>
    <script async src="/portal.js"></script>
  </body>
</html>
`

  res.setHeader('content-type', 'text/html; charset=utf-8')
  res.write(html)
  res.end()

  return null
}

const respondWithJSON = (res, obj) => {
  res.setHeader('content-type', 'application/json')
  // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3030')
  // res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.write(JSON.stringify(obj))
  res.end()
  return null
}

export default () => {
  // TODO: accept options:
  //  patient: {...}
  //  assignee: 'same' | 'different' | null
  //  treatment: 'XX'
  // TODO: Add available treatments list
  WebApp.connectHandlers.use('/portal', async (req, res, next) => {
    console.log('[portal]', req.method, req.url)
    switch (req.method) {
      case 'GET':
        // req.url is subscoped at /portal, so it's /portal/appointments
        if (req.url.endsWith('/appointments')) {
          try {
            const bookables = getBookables()

            return respondWithJSON(res, bookables)
          } catch (e) {
            console.error(e)
            return respondWithJSON(res, {error: 'unknown-server-error'})
          }
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html'
          })
          return res.end(Assets.getText('portal.html'))
        }
      // book appointment
      case 'POST':
        if (req.url.endsWith('/appointments')) {
          try {
            const body = await parse.json(req)
            const response = await handleAppointmentBooking(body)
            return respondWithJSON(res, response)
          } catch (e) {
            console.log(e)
            return respondWithJSON(res, {error: 'unknown-server-error'})
          }
        }
      default: return respondWithJSON(res, {error: 'unknown-server-error'})
    }
  })

  WebApp.connectHandlers.use('/contact', async (req, res, next) => {
    switch (req.method) {
      case 'GET':
        try {
          return respondWith(res, ContactForm)
        } catch (e) {
          console.error(e)
          return respondWith(res, ErrorMessage)
        }
      case 'POST':
        try {
          const body = await parse.form(req)
          const Response = await handleContactForm(body)
          return respondWith(res, Response)
        } catch (e) {
          console.error(e)
          return respondWith(res, ErrorMessage)
        }
      default: return respondWith(res, ErrorMessage)
    }
  })

}
