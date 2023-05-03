import { useState, useEffect } from 'react'
import { Formik, Form } from 'formik'
import { Section, ErrorBoundary, Checkbox, Input, Required, CleaveInput, Radio, Select, errorMessage } from './components'
import { apiBaseUrl } from './apiBaseUrl'

export const ContactForm = (props) => {
  const [initialPending, setInitialPending] = useState(true)
  const [pending, setPending] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [pages, setPages] = useState(null)
  const [page, setPage] = useState(0)
  const [canRefresh, setCanRefresh] = useState(false)

  const refresh = async () => {
    setCanRefresh(false)
    setPending(true)
    const res = await fetch((apiBaseUrl || '') + '/portal/appointments')
    const ps = await res.json()
    setPages(ps)
    const refreshable = setTimeout(() => setCanRefresh(true), 3000)
    setPending(false)
    if (initialPending) {
      setInitialPending(false)
    }
    console.log(ps)
    return () => clearTimeout(refreshable)
  }

  useEffect(refresh, [page]) // TODO: refresh on form values change, post as params

  // responsive hack: show one day on mobile only
  const pageSize = (typeof document !== 'undefined' && document.body.clientWidth < 500) ? 1 : 3

  const days = (pages || []).slice(page * pageSize, page * pageSize + pageSize)

  const next = pages && (pages.length > (page * pageSize + pageSize)) && (() => setPage(page + 1))
  const prev = pages && page > 0 && (() => setPage(page - 1))

  // Edge case fix: navigate to page 2/2, wait until all bookables are gone, refresh, stuck on an empty page
  if (page > 0 && (!days || days.length === 0) && pages && pages.length > 0) {
    console.log('resetting page to zero when there are pages but no days')
    setTimeout(() => setPage(0), 20)
  }

  console.log('rr', pages, 'page', page,
  page * pageSize, page * pageSize + pageSize,
  'p<', (Math.floor((pages || []).length / pageSize) - 1),
  !!prev, !!next)



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
        refresh()
        setError(e)
      }
    }}
  >
    {({ values, isSubmitting, handleChange, setFieldValue }) => {
      const selectedBookable = values.bookableId && pages && (() => {
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i]
          if (page) {
            for (let j = 0; j < page.times.length; j++) {
              const time = page.times[j]
              if (time && time._id === values.bookableId) {
                return { ...time, day: page.day }
              }
            }
          }
        }
      })()

      if (success) {
        return <Success {...props} success={success} />
      }
    
      if (!pages || initialPending) {
        return <Notice>Einen Moment bitte, verfügbare Termine werden gesucht...</Notice>
      }

      if ((!pages || pages.length === 0) && (!days || days.length === 0)) {
        return <Notice>Entschuldigung, momentan sind leider keine Termine online verfügbar. Bitte kontaktieren Sie uns telefonisch.</Notice>
      }

      return <div>
          <h2>{props.welcome || 'Sehr geehrte Patientin, sehr geehrter Patient!'}</h2>
          <p><b>{props.instructionsDisclaimer}</b></p>
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
              label='Geburtstag'
              placeholder='tt.mm.jjjj'
              required
              pattern='[0-9]{2}\.[0-9]{2}\.[0-9]{4}'
              minLength='10'
              maxLength='10'
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
              pattern='[0-9]{4} [0-9]{6}'
              minLength='11'
              maxLength='11'
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
              minLength='3'
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
              (values.appointment === true || values.appointment === 'true') &&
              <div>
                {/* {
                  tags.length > 1 &&
                  <Section>
                    <Select label='Was benötigen Sie?' name='tag'>
                      <option disabled value={''}>-</option>
                      <option value='tag1'>Erstordination (Kasse)</option>
                      <option value='tag1'>Muttermalkontrolle (Kasse)</option>
                      <option value='tag2'>Ästhetik (Privat)</option>
                    </Select>
                  </Section>
                } */}
                {/* {
                  requestAssignee &&
                  <Section>
                    <RequestSameAssignee />
                  </Section>
                } */}

                <Section>
                  <ErrorBoundary>
                    <Section>
                      <p>
                        Wählen Sie Ihren Wunschtermin
                        &emsp;
                        {canRefresh &&
                          <a
                            href='#'
                            style={{ opacity: 0.8, display: 'inline-block', paddingLeft: 20 }}
                            onClick={(e) => { e.preventDefault(); refresh(); }}
                          >
                            Neu laden
                          </a>
                        }
                      </p>

                      {/* causes jumping */}
                      {/* {pending && <p><i>Verfügbare Termine werden gesucht...</i></p>} */}

                      <div style={slotPickerStyle}>
                        <Button
                          title={prev
                            ? 'Frühere Termine'
                            : 'Keine früheren Termine verfügbar'}
                          disabled={!prev}
                          style={arrowButtonStyle}
                          onClick={(e) => { e.preventDefault(); prev() }}
                        >
                          &lt;
                        </Button>

                        {days.map(d =>
                          <Day
                            key={d.day}
                            {...d}
                            onClick={() => {
                              setFieldValue('bookableId', d.times[0]._id)
                            }} />
                        )}

                        <Button
                          title={next
                            ? 'Spätere Termine'
                            : 'Keine späteren Termine verfügbar'}
                          disabled={!next}
                          style={arrowButtonStyle}
                          onClick={(e) => { e.preventDefault(); next() }}
                        >
                          &gt;
                        </Button>
                      </div>

                      { /* this should not happen */
                        (page > 0 && (!days || days.length === 0)) &&
                          <Notice>Keine Termine gefunden</Notice>
                      }

                      <Section>
                        {
                          selectedBookable &&
                          <span>
                            <b>Ihr Termin:</b>
                            &nbsp;
                            <b>{selectedBookable.day}</b> um <b>{selectedBookable.time}&nbsp;Uhr</b>
                            
                            {/* {selectedBookable.assigneeName &&
                              <span> bei <b>{selectedBookable.assigneeName}</b></span>} */}

                            {/* {selectedBookable.isReserve &&
                              <p><b>
                                ⚠️ &emsp; Reservetermin bzw. Einschub: Bei diesem Termin kann es zu sehr langen Wartezeiten kommen.
                              </b></p>} */}
                          </span>
                        }
                        <p>
                          Wir möchten Sie darauf aufmerksam machen, dass es bei Terminen in der Kassenordination zu längeren Wartezeiten kommen kann.<br />
                          Sie können uns gerne telefonisch kontaktieren, um einen privaten Termin zu vereinbaren.
                        </p>

                      </Section>
                    </Section>
                  </ErrorBoundary>
                </Section>
              </div>
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

              {error && <p><b>
                Entschuldigung! Ihr gewählter Termin ist leider nicht mehr verfügbar. Bitte versuchen Sie, einen anderen Termin zu buchen oder kontaktieren Sie und telefonisch.
              </b></p>}

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

    <p>
      Wir möchten Sie darauf aufmerksam machen, dass es bei Terminen in der Kassenordination zu längeren Wartezeiten kommen kann.<br />
      Sie können uns gerne telefonisch kontaktieren, um einen privaten Termin zu vereinbaren.
    </p>

    {/* {appointment.isReserve &&
      <p>
        ⚠️ &emsp; Reservetermin bzw. Einschub: Bei diesem Termin kann es zu sehr langen Wartezeiten kommen.
      </p>} */}

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

const RequestSameAssignee = () => {
  return <div>
    <label htmlFor='requestSameAssignee'>
      <span>Wer soll Sie behandeln?</span>
    </label>
    <Radio
      name='requestSameAssignee'
      value='dontcare'
      label='Egal, die Person mit dem nächsten freien Termin'
      required
    />
    <Radio
      name='requestSameAssignee'
      value='true'
      label='Die selbe Person wie letztes Mal'
      required
    />
    <Radio
      name='requestSameAssignee'
      value='false'
      label='Eine andere Person als letztes Mal'
      required
    />
  </div>
}

const buttonStyle = {
  width: 34,
  height: 31,
  fontSize: '12pt',
  padding: '4px 0px 0px 0px'
}

const Button = ({ children, style = {}, ...props }) =>
  <button
    className={`button ${props.disabled && 'disabled'}`}
    style={{ ...buttonStyle, ...style }}
    {...props}>
    {children}
  </button>

const slotPickerStyle = {
  display: 'flex'
}

const dayStyle = {
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 15,
  marginRight: 15
}

const timeLabelStyle = {
  padding: 10,
  borderRadius: 4,
  marginBottom: 4,
  cursor: 'pointer',
  background: 'rgba(128,128,128,0.05)',
  borderBottom: '2px solid rgba(128,128,128,0.1)'
}

const timeLabelHoverStyle = {
  ...timeLabelStyle,
  background: 'rgba(128,128,128,0.1)',
  borderBottom: '2px solid rgba(128,128,128,0.4)'
}

const timeLabelStyleChecked = {
  ...timeLabelStyle,
  color: 'white',
  background: 'rgba(29, 97, 167, 1)',
  borderBottom: '2px solid rgba(29, 70, 135, 1)'
}

const timeLabelInnerStyle = {
  paddingLeft: 4,
  paddingRight: 10
}

const Time = ({ _id, day, time, assigneeNameShort, isReserve }) => {
  const [hover, setHover] = useState(false)

  const label = <span>
    {time} {/* isReserve && ' ⚠️' */}

    {/* <span style={{ whiteSpace: 'nowrap' }}>
      {assigneeNameShort && <span><br /><span style={{ opacity: 0.6, whiteSpace: 'nowrap' }}>{assigneeNameShort}</span></span>}
    </span> */}
  </span>

  const title = isReserve
    ? [day, time].join(' um ') + ' Uhr' // [day, time].join(' um ') + ' Uhr - Reservetermin mit langen Wartezeiten'
    : [day, time].join(' um ') + ' Uhr'

  return <div
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    title={title}
  >
    <Radio
      name='bookableId'
      value={_id}
      label={label}
      required
      labelStyle={hover ? timeLabelHoverStyle : timeLabelStyle}
      checkedLabelStyle={timeLabelStyleChecked}
      labelInnerStyle={timeLabelInnerStyle}
    />
  </div>
}

const dayHeaderStyle = {
  textAlign: 'center',
  fontWeight: 'bold',
  cursor: 'pointer',
  userSelect: 'none',
  marginBottom: 8
}

const Day = ({ day, times, onClick }) => {
  return <div style={dayStyle}>
    <div style={dayHeaderStyle} onClick={onClick}>
      {day}
    </div>
    {times.map(t =>
      <Time
        key={t._id}
        {...t}
        day={day}
      />
    )}
  </div>
}

const arrowButtonStyle = {
  width: 33
}

const Notice = ({ children }) =>
  <p style={{ marginTop: '2em', marginBottom: '2em' }}>
    <b>{children}</b>
  </p>
