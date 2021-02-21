import { Formik, Form, Field } from 'formik'
import { Section, Checkbox, Input, Required, Radio, Select } from './components'

export const ContactForm = () => {
  return <Formik
    initialValues={{
      gender: '-',
      titlePrepend: '',
      firstName: '',
      lastName: '',
      birthdate: '',
      telephone: '',
      email: '',
      existingPatient: false,
      referral: false,
      prescription: false,
      appointment: false,
      privacy: false
    }}
    onSubmit={(values, { setSubmitting }) => {
      console.log(values)
      setTimeout(() => setSubmitting(false), 1000)
    }}
  >
    {({ values }) =>
      <div>
        <h2>Sehr geehrte Patientin, sehr geehrter Patient!</h2>
        <p>Wir bitten Sie um Vervollständigung des Kontaktformulars. Nach Erhalt werden wir uns schnellstmöglich telefonisch mit Ihnen in Verbindung setzen, um Ihr Anliegen zu besprechen bzw. einen Termin zu vereinbaren.</p>
        <Form method='POST'>
          <Select label='Anrede' name='gender'>
            <option value='Female'>Frau</option>
            <option value='Female'>Herr</option>
            <option value='other'>-</option>
          </Select>

          <Input name='titlePrepend' label='Titel' />
          <Input name='firstName' label='Vorname' required />
          <Input name='lastName' label='Nachname' required />
          <Input name='birthdate' label='Geburtsdatum' required placeholder='tt.mm.jjjj' />
          <Input name='telephone' label='Telefonnummer' required />
          <Input name='email' label='E-Mail-Adresse' />

          <Section>
            <label htmlFor='existingPatient'>
              <span>Sind Sie bereits Patient bei uns?</span>
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
          </Section>

          <Section>
            <label>Ich benötige:</label><br />
            <Checkbox name='prescription' label='Rezept' />
            <Checkbox name='referral' label='Überweisung' />

            {/* id needs to be 'appointment' for public/portal.js to attach listeners */}
            <Checkbox name='appointment' label='Termin' />
          </Section>

          {/* public/portal.js renders into this div */}
          <div id='booking-widget' />

          <Section>
            <Checkbox name='privacy' required label='* Ich stimme zu, dass meine ausgefüllten persönlichen Daten: Anrede, Titel, Vorname, Nachname, Geburtsdatum, Telefonnummer und E-Mail-Adresse von Dr. Sabine Schwarz & Partner Fachärzte für Haut- und Geschlechtskrankheiten GmbH, sowie deren Datenverarbeitern (Fixpoint Systems GmbH, Hetzner Online GmbH) zum Zwecke der Beantwortung des ausgefüllten Kontaktformulars verarbeitet werden. Diese Zustimmung kann jederzeit ohne Angabe von Gründen per Mail an Datenschutz@hautzentrum-wien.at widerrufen werden.' />
          </Section>

          <Section>
            <p>
              Ich und mein Team freuen uns, Sie bei uns begrüßen zu dürfen!
              <br />
              Wir sind für Sie da!
            </p>

            <p>
              <i>Ihre Dr. Sabine Schwarz</i>
            </p>

            <input
            className='button'
            type='submit'
            value='Senden'
            />

            <pre>
              {JSON.stringify(values, null, 2)}
            </pre>

            <p>
              <Required /> Pflichtfelder
            </p>
          </Section>

        </Form>
      </div>
    }
  </Formik>
}

export const Success = () =>
  <div>
    <h2>Vielen Dank!</h2>
    <p>Wir haben Ihre Anfrage erhalten und werden Sie so rasch wie möglich kontaktieren.</p>
    <Section>
      <p>
        Ich und mein Team freuen uns, Sie bei uns begrüßen zu dürfen!
        <br />
        Wir sind für Sie da!
      </p>
      <p>
        <i>Ihre Dr. Sabine Schwarz</i>
      </p>
    </Section>
  </div>
