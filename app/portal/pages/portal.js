import { useState } from 'react'
import { Formik, Form, validateYupSchema } from 'formik'
import { Section, Checkbox, Input, Required, CleaveInput, Radio, Select, errorMessage } from '../components'
import Media from './media'
import { apiBaseUrl } from '../apiBaseUrl'

const Login = ({ onSuccess, ...props }) => {
  const [error, setError] = useState(null)
  const [twoFactor, setTwoFactor] = useState(false)

  return <>
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        insuranceId: '',
        twoFactorCode: ''
      }}
      onSubmit={async (values, { setSubmitting }) => {
        console.log(values)
        setError(null)
        setSubmitting(true)

        if (twoFactor) { // step 2
          try {
            const body = JSON.stringify({
              code: values.twoFactorCode,
              insuranceId: values.insuranceId,
              firstName: values.firstName,
              lastName: values.lastName
            })
            const req = await fetch((apiBaseUrl || '') + '/portal/two-factor',
              {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                  'content-length': body.length
                },
                body: body
              })
            const res = await req.json()

            setSubmitting(false)

            if (res.token) {
              onSuccess(res.token)
            }

            if (res.error) {
              setError(res.error)
            }

            console.log('res2', res)
          } catch (e) {
            setSubmitting(false)
            setError(e)
          }
        } else { // step 1
          try {
            const body = JSON.stringify({
              insuranceId: values.insuranceId,
              firstName: values.firstName,
              lastName: values.lastName
            })
            const req = await fetch((apiBaseUrl || '') + '/portal/login',
              {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                  'content-length': body.length
                },
                body: body
              })
            const res = await req.json()

            setSubmitting(false)
            setTwoFactor(true)
            console.log('res', res)
          } catch (e) {
            setSubmitting(false)
            setError(e)
          }
        }
      }}
    >
      {({ values, isSubmitting, handleChange, resetForm }) => {
        const logout = () => {
          resetForm()
          setError(null)
          setTwoFactor(false)
        }

        return <>
          {
            twoFactor
            ? <>
              <h2>Bestätigung per SMS</h2>
              <p>Bitte geben Sie den 5-stelligen Code ein, der Ihnen per SMS zugesandt wurde.</p>
              <Form method='POST'>
                <CleaveInput
                  name='twoFactorCode'
                  label='Einmal-Code (5 Stellen)'
                  required
                  placeholder='0 0 0 0 0'
                  options={{
                    numericOnly: true,
                    blocks: [1, 1, 1, 1, 1],
                    delimiter: ' '
                  }}
                />
                {error && <p><b>{`${error}`}</b></p>}
                <input
                  disabled={isSubmitting || !(values.twoFactorCode.length === 5)}
                  className='button'
                  type='submit'
                  value='Einloggen'
                />

                <p className='text-muted pt3'>Wenn Sie nach 5 Minuten noch keinen Code erhalten haben, überprüfen Sie Ihre Eingaben auf der vorherigen Seite oder kontaktieren Sie die Ordination.</p>

                <a href='#' onClick={logout}>
                  &lt; Zurück
                </a>

              </Form>
            </>
            : <div>
              <h2>{props.welcome || 'Sehr geehrte Patientin, sehr geehrter Patient!'}</h2>
              <p>{props.instructions || 'Über dieses Formular können Sie die im Rahmen Ihrer Untersuchung oder Behandlung angefertigten Bilder und Befunde bis zu 14 Tage lang nach Ihrem Termin einsehen. Melden Sie sich dazu mit ihren in der Ordination bestätigten Daten an.'}</p>
              <Form method='POST'>
                <Input name='firstName' label='Vorname' required />
                <Input name='lastName' label='Nachname' required />
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
                {error && <p><b>{`${error}`}</b></p>}
                <input
                  disabled={isSubmitting || !(values.firstName && values.lastName && values.insuranceId && values.insuranceId.length === 10)}
                  className='button'
                  type='submit'
                  value='Einloggen'
                />
              </Form>
            </div>
          }
        </>
      }}
    </Formik>
  </>
}

const Portal = () => {
  const [token, setToken] = useState(null)
  if (!token) {
    return <>
      <Login onSuccess={setToken} />
    </>
  } else {
    return <>
      <h1>Ihre Befunde und Bilder</h1>
      <Media token={token} />
      <br/>
      <br/>
      <a href="#"
        onClick={e => {window.location.reload()}}
      >Ausloggen</a>
    </>
  }
}

export default Portal
