import { useState } from 'react'
import { Formik, Form } from 'formik'
import { AppointmentBooking } from './AppointmentBooking'
import { Section, Checkbox, Input, Required, CleaveInput, Radio, Select, errorMessage } from './components'
import { apiBaseUrl } from './apiBaseUrl'

export const ContactForm = (props) => {
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  if (success) {
    return <Success {...props} success={success} />
  }

  return <Formik
    initialValues={{
      gender: '',
      titlePrepend: '',
      firstName: '',
      lastName: '',
      birthday: '',
      insuranceId: '',
      telephone: '',
      email: '',
      existingPatient: false,
      referral: false,
      prescription: false,
      appointment: true,
      privacy: false,
      requestSameAssignee: 'dontcare',
      slot: '',
      tag: ''
    }}
    onSubmit={async (values, { setSubmitting }) => {
      console.log(values)
      setSuccess(null)
      setError(null)

      try {
        const body = JSON.stringify(values)
        const req = await fetch((apiBaseUrl || '') + '/portal/appointments',
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'content-length': body.length
            },
            body: body
          })
        const res = await req.json()

        console.log(res)
        if (res.ok) {
          setSuccess(res)
        } else {
          setError(res)
        }

        setSubmitting(false)
      } catch (e) {
        setSubmitting(false)
        setError(e)
      }
    }}
  >
    {({ values, isSubmitting, handleChange }) =>
      <div>
        <h2>{props.welcome || 'Sehr geehrte Patientin, sehr geehrter Patient!'}</h2>
        <p>{props.instructions || 'Wir bitten Sie um Vervollständigung des Kontaktformulars. Nach Erhalt werden wir uns schnellstmöglich mit Ihnen in Verbindung setzen, um Ihr Anliegen zu besprechen bzw. einen Termin zu vereinbaren.'}</p>
        <p><b>{props.instructionsDisclaimer}</b></p>
        <Form method='POST'>
          <Select label='Anrede' name='gender'>
            <option disabled value={''}>-</option>
            <option value='Female'>Frau</option>
            <option value='Male'>Herr</option>
            <option value='other'>Divers</option>
          </Select>

          <Input name='titlePrepend' label='Titel' />
          <Input name='firstName' label='Vorname' required />
          <Input name='lastName' label='Nachname' required />
          <CleaveInput
            name='birthday'
            label='Geburtstag' required placeholder='tt.mm.jjjj'
            options={{
              delimiter: '.',
              blocks: [2, 2, 4],
              numericOnly: true
            }}
          />
          <CleaveInput
            name='insuranceId'
            label='Sozialversicherungsnummer (10 Stellen)'
            required
            pattern="[0-9\s]+"
            placeholder='0000 000000'
            options={{
              numericOnly: true,
              blocks: [4, 6],
              delimiter: ' '
            }}
          />
          <Input
            name='telephone'
            label='Telefonnummer'
            required
            placeholder='+43 660 0000000'
          />
          {/* <Input name='email' label='E-Mail-Adresse' /> */}

          {/* <Section>
            <label htmlFor='existingPatient'>
              <span>Sind Sie bereits {
                values.gender === 'Female'
                ? 'Patientin'
                : (values.gender === 'Male' ? 'Patient' : 'PatientIn')
                } bei uns?</span>
              <Required />
            </label>
            <Radio
              name='existingPatient'
              value='true'
              label='Ja'
              required
            />
            <Radio
              name='existingPatient'
              value='false'
              label='Nein'
              required
            />
          </Section> */}

          {/* <Section>
            <label>Ihr Anliegen:</label><br />
            <Checkbox name='prescription' label='Rezept' />
            <Checkbox name='referral' label='Überweisung' />
            <Checkbox name='appointment' label='Termin' />
          </Section> */}

          {
            <AppointmentBooking
              show={values.appointment === true || values.appointment === 'true'}
            />
          }

          <Section>
            <Checkbox name='privacy' required label={`* Ich stimme zu, dass meine ausgefüllten persönlichen Daten: Anrede, Titel, Vorname, Nachname, Geburtsdatum, Telefonnummer und E-Mail-Adresse von ${props.customerName}, sowie deren Datenverarbeitern (Fixpoint Systems GmbH, Hetzner Online GmbH) zum Zwecke der Beantwortung des ausgefüllten Kontaktformulars verarbeitet werden. Diese Zustimmung kann jederzeit ohne Angabe von Gründen per Mail an ${props.customerEmail} widerrufen werden.`} />
            <p>{props.disclaimer}</p>
          </Section>

          <Section>
            <p>
              {props.regards}
            </p>

            <p>
              <i>{props.greeting}</i>
            </p>

            {error && <p><b>{errorMessage}</b></p>}

            <input
              disabled={isSubmitting}
              className='button'
              type='submit'
              value='Senden'
            />

            {/* <pre>
              {JSON.stringify(values, null, 2)}
            </pre> */}

            <p>
              <Required /> Pflichtfelder
            </p>
          </Section>

        </Form>
      </div>
    }
  </Formik>
}

const downloadFile = (fileUrl, fileName) => {
  try {
    if (!window.ActiveXObject) {
      const save = document.createElement('a')
      save.href = fileUrl
      save.target = '_blank'
      save.download = fileName
      var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      })
      save.dispatchEvent(evt)
      (window.URL || window.webkitURL).revokeObjectURL(save.href)
    } else if (!!window.ActiveXObject && document.execCommand) { // for IE < 11
      var _window = window.open(fileUrl, '_blank')
      _window.document.close()
      _window.document.execCommand('SaveAs', true, fileName)
      _window.close()
    }
  } catch (e) {
    console.error('Failed to download file')
    console.error(e)
  }
}

const downloadIcal = ({ appointment, name, description, url, location }) => {
  const isoToIcal = s => s.replace(/-/g, '').replace(/:/g, '').replace(/\.\d\d\dZ$/, 'Z')
  const now = isoToIcal((new Date()).toISOString())
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fixpoint Systems GmbH//Portal//DE',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:b' + (appointment.bookableId || appointment._id) + '@fxp.at',
    'DTSTAMP:' + now,
    'LAST-MODIFIED:' + now,
    'DTSTART:' + isoToIcal(appointment.isoStart),
    'DTEND:' + isoToIcal(appointment.isoEnd),
    'DESCRIPTION:' + description.replace(/,/g, '\\,'),
    'SUMMARY:' + name.replace(/,/g, '\\,'),
    'LOCATION:' + location.replace(/,/g, '\\,'),
    'URL:' + url,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ]

  const dataUrl = 'data:text/calendar;base64,' + window.btoa(unescape(encodeURIComponent(lines.join('\r\n'))))
  downloadFile(dataUrl, 'Termin.ics')
}

const AppointmentSuccess = ({ appointment, confirmationInfo, ical }) => {
  return <div>
    <p>
      Wir bestätigen Ihren Termin am <b>{appointment.date}</b> um <b>{appointment.time} Uhr</b>.
    </p>

    {appointment.isReserve &&
    <p>
      ⚠️ &emsp; Reservetermin bzw. Einschub: Bei diesem Termin kann es zu sehr langen Wartezeiten kommen.
    </p>}

    {confirmationInfo}

    <button
      onClick={e => { window.print(); return false; }}
      className='button secondary'
    >Terminbestätigung drucken</button>

    {ical &&
      <button
        onClick={e => {
          downloadIcal({
            appointment,
            ...ical
          });
          return false;
        }}
        className='button secondary'
      >Im Kalender speichern</button>
    }


  </div>
}

export const Success = ({ greeting = '', contactInfo, success, ...props }) =>
  <div>
    <h2>Vielen Dank!</h2>

    {success && success.appointment
      ? <AppointmentSuccess appointment={success.appointment} {...props} />
      : <p>Wir haben Ihre Anfrage erhalten und werden Sie so rasch wie möglich kontaktieren.</p>
    }

    <Section>
      <p>
        <i>{greeting}</i>
      </p>
      <p className='print-only'>
        {contactInfo}
      </p>
    </Section>
  </div>
