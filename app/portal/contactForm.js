import { useState } from 'react'
import { Formik, Form } from 'formik'
import { AppointmentBooking } from './AppointmentBooking'
import { Section, Checkbox, Input, Required, CleaveInput, Radio, Select, errorMessage } from './components'

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
        const req = await fetch((props.apiBaseUrl || '') + '/portal/appointments',
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
              apiBaseUrl={props.apiBaseUrl}
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

export const Success = ({ greeting = '', success }) =>
  <div>
    <h2>Vielen Dank!</h2>

    {success && success.appointment
      ? <p>Wir bestätigen Ihren Termin am <b>{success.appointment.date}</b> um <b>{success.appointment.time} Uhr</b>.</p>
      : <p>Wir haben Ihre Anfrage erhalten und werden Sie so rasch wie möglich kontaktieren.</p>
    }

    <Section>
      <p>
        <i>{greeting}</i>
      </p>
    </Section>
  </div>
