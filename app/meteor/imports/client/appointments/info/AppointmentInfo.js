import React from 'react'
import identity from 'lodash/identity'
import { Users } from '../../../api/users'
import { touch, Field, FieldArray, FormSection } from 'redux-form'
import { Switch } from 'redux-form-material-ui'
import moment from 'moment-timezone'
import { InputAdornment } from 'material-ui/Input'
import { LinearProgress } from 'material-ui/Progress'
import NumberFormat from 'react-number-format'
import { withState } from 'recompose'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../components/Icon'
import { grow, rowStyle, flex, shrink, TextField, ToggleField, iconStyle } from '../../components/form'
import { Dot } from '../../patients/Dot'
import { ContactFields } from '../../patients/fields/ContactFields'
import { AddressFields } from '../../patients/fields/AddressFields'
import { BirthdayFields } from '../../patients/fields/BirthdayFields'
import { NameFields, GenderField } from '../../patients/fields/NameFields'
import { Stamps } from '../../helpers/Stamps'
import { Logs } from '../../helpers/Logs'
import { Currency } from '../../components/Currency'
import { TagsField } from '../../tags/TagsField'
import { calculateRevenue, RevenueField } from '../new/RevenueField'

const iconDefaultStyle = {
  textAlign: 'center',
  paddingLeft: 6,
  paddingRight: 6,
  minWidth: 50,
}

const logFormat = {
  move: log => {
    const movedDay = !moment(log.payload.oldStart).isSame(log.payload.newStart, 'day')
    const movedTime = moment(log.payload.oldStart).format('HHmm') !== moment(log.payload.newStart).format('HHmm')
    const movedAssignee = log.payload.oldAssigneeId !== log.payload.newAssigneeId

    if (!(movedDay || movedTime || movedAssignee)) {
      return null
    }

    const getAssigneeName = _id => {
      if (_id) {
        return Users.methods.fullNameWithTitle(Users.findOne({ _id }))
      } else {
        return '(Einschub)'
      }
    }

    return [
      'Verschoben von',
      movedDay && moment(log.payload.oldStart).format(TAPi18n.__('time.dateFormatShortNoYear')),
      movedTime && moment(log.payload.oldStart).format(TAPi18n.__('time.timeFormat')),
      movedAssignee && getAssigneeName(log.payload.oldAssigneeId),
      '→',
      movedDay && moment(log.payload.newStart).format(TAPi18n.__('time.dateFormatShortNoYear')),
      movedTime && moment(log.payload.newStart).format(TAPi18n.__('time.timeFormat')),
      movedAssignee && getAssigneeName(log.payload.newAssigneeId),
      'von'
    ].filter(identity).join(' ')
  }
}

const ListItem = ({ icon, children, hr, style, iconStyle, highlight }) => {
  const containerStyle = highlight
    ? {
      ...style,
      backgroundColor: '#FFF9C4'
    } : style

  return <div style={containerStyle}>
    <div style={flex}>
      <div style={{ ...iconDefaultStyle, ...iconStyle }}>
        {icon && <Icon name={icon} />}
      </div>
      <div style={grow} className='enable-select'>
        {children}
      </div>
    </div>
    {hr && <hr />}
  </div>
}

const PlainRenderField = ({ input, append, prepend }) =>
  input.value && <span>
    {prepend}
    {input.value}
    {append}
  </span> || null

const PatientName = withState('editing', 'setEditing', false)(({ patient, editing, setEditing, onChange }) => (
  <div
    style={{
      ...rowStyle,
      paddingLeft: 10,
      marginLeft: -10,
      marginTop: -16,
      marginBottom: -8
    }}>
    <GenderField onChange={() => setTimeout(onChange, 30)} />
    <div
      onMouseEnter={() => setEditing(true)}
      onMouseLeave={() => {
        setEditing(false)
        onChange()
      }}>

      {
        editing
        ? <NameFields titles gender={false} />
        : (
          <h4 className='enable-select' style={{ marginLeft: -5, marginTop: 26 }}>
            <Field
              name='titlePrepend'
              component={PlainRenderField}
              append={<span>&ensp;</span>} />

            <b>
              <Field
                name='lastName'
                component={PlainRenderField} />
            </b>
            &thinsp;
            <Field
              name='firstName'
              component={PlainRenderField} />

            <Field
              name='titleAppend'
              component={PlainRenderField}
              prepend={<span>&ensp;</span>} />
          </h4>
        )
      }
    </div>
  </div>
))

const Day = ({ appointment }) => (
  <ListItem icon='calendar' hr>
    {moment(appointment.start).format(TAPi18n.__('time.dateFormatWeekday'))}
  </ListItem>
)

const Time = ({ appointment }) => (
  <ListItem icon='clock-o' hr>
    {moment(appointment.start).format(TAPi18n.__('time.timeFormatShort'))}
    &nbsp;-&nbsp;
    {moment(appointment.end).format(TAPi18n.__('time.timeFormat'))}
  </ListItem>
)

const toFloat = v =>
  v
    ? parseFloat(v.toString().replace(/,/g, '.').replace(/\s/g, ''))
    : null

const CurrencyFieldInner = (props) => {
  // Swallow warning about unknown inputRef prop input
  const { inputRef, ...restProps } = props

  return <NumberFormat
    {...restProps}
    onValueChange={values => {
      props.onChange({
        target: {
          value: values.value
        }
      })
    }}
    thousandSeparator=' '
    decimalSeparator=','
    onKeyDown={(e) => {
      const {key, target} = e
      const {selectionStart, value} = target
      if (key === '.') {
        e.preventDefault()
        target.value = `${value.substr(0, selectionStart)},${value.substr(selectionStart, value.length)}`
      }
    }}
  />
}

const CurrencyField = (props) =>
  <TextField
    {...props}
    InputProps={{
      inputComponent: CurrencyFieldInner,
      startAdornment: <InputAdornment position='start'>€</InputAdornment>
    }}
  />

const Private = () => (
  <ListItem icon='plus-circle' style={{ marginBottom: 20 }}>
    {TAPi18n.__('appointments.private')}

    <div className='pull-right' style={{ marginTop: -10 }}>
      <Field
        name='revenue'
        component={CurrencyField}
        // format={twoPlaces}
        normalize={toFloat}
      />
    </div>
  </ListItem>
)

const Assignee = ({ assignee }) => (
  assignee && <ListItem icon='user-md' hr>
    {Users.methods.fullNameWithTitle(assignee)}
  </ListItem> || null
)

const Contacts = ({ patient }) => (
  patient &&
    <div>
      <FieldArray
        name='contacts'
        channel='Phone'
        icon='phone'
        zoomable
        component={ContactFields} />

      <FieldArray
        name='contacts'
        channel='Email'
        icon='envelope-open-o'
        component={ContactFields} />
    </div> || null
)

const autofillRevenue = change => (e, tags) => {
  if (tags && tags.length >= 1) {
    const revenue = calculateRevenue(tags)
    if (revenue === 0 || revenue > 0) {
      change('appointment.revenue', revenue)
    }
  }
}

const Tags = ({ appointment, allowedTags, maxDuration, assignee, calendar, change }) => (
  <ListItem hr>
    <Field
      name='tags'
      component={TagsField}
      allowedTags={allowedTags}
      maxDuration={maxDuration}
      calendarId={calendar._id}
      assigneeId={assignee && assignee._id}
      showDefaultRevenue={false}
      onChange={autofillRevenue(change)}
      fullWidth
    />
  </ListItem>
)

const Reminders = () => (
  <ListItem icon='paper-plane'>
    {TAPi18n.__('appointments.appointmentReminderSMS')}
    <div className='pull-right' style={{
      position: 'relative',
      right: 5,
      top: -15
    }}>
      <Field
        name='reminders'
        color='primary'
        component={Switch}
      />
    </div>
    <br /><br />
  </ListItem> || null
)

const TotalRevenue = ({ value }) => (
  value && value > 0 && <ListItem icon='pie-chart'>
    Gesamtumsatz&ensp;
    <Currency value={value} />
  </ListItem> || null
)

const PatientNotes = ({ patient }) => (
  <div style={rowStyle}>
    <div style={iconStyle}>
      <Icon name='user-plus' />
    </div>
    <div style={{...grow, backgroundColor: patient.note ? '#FFF9C4' : ''}}>
      <Field
        name='note'
        component={TextField}
        multiline
        rows={1}
        rowsMax={5}
        label={TAPi18n.__('patients.note')}
      />
    </div>

    <div style={shrink}>
      <Field
        name='banned'
        component={ToggleField}
        button={false}
        style={{ marginTop: 15, marginLeft: 20 }}
        values={[
          { value: false, label: <Dot /> },
          { value: true, label: <Dot banned /> }
        ]} />
    </div>
  </div>
)

const AppointmentNote = ({ appointment }) =>
  <ListItem icon='pencil' hr highlight={!!appointment.note}>
    <Field
      name='note'
      label={TAPi18n.__('appointments.note')}
      multiline
      rows={3}
      component={TextField}
      fullWidth
    />
  </ListItem>

export class AppointmentInfo extends React.Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentWillMount () {
    // TODO: This doensn't work.
    // TODO: How to show validation errors even on untouched fields?
    setTimeout(() =>
      touch('appointmentInfoForm', 'contacts', 'birthday', 'insuranceId'),
      500
    )
  }

  // BUG: This seems to never get called. Why?
  handleSubmit (e) {
    e && e.preventDefault()
    if (this.props.dirty) {
      return Promise.all([
        this.props.handleSubmit(this.props.handleEditPatient),
        this.props.handleSubmit(this.props.handleEditAppointment)
      ])
    }
  }

  render () {
    const {
      loading,
      handleSubmit,
      dirty,
      appointment,
      patient,
      assignee,
      calendar,
      totalPatientRevenue,
      allowedTags,
      maxDuration,
      change,
      handleEditPatient,
      handleEditAppointment,
      handleToggleGender,
      handleSetMessagePreferences } = this.props

    return (
      <form onSubmit={this.handleSubmit}>
        {/* {loading && <LinearProgress style={loadingStyle} />} */}
        {
          patient &&
            <div className='row'>
              <div className='col-md-12'>
                <FormSection name='patient'>
                  <PatientName
                    onChange={handleSubmit(handleEditPatient)}
                    patient={patient} />
                </FormSection>
                <hr />
              </div>
            </div>
        }
        <div className='row'>
          <div className='col-md-6'>
            <div onMouseLeave={
              dirty
              ? handleSubmit(handleEditAppointment)
              : identity
            }>
              <FormSection name='appointment'>
                <Day appointment={appointment} />
                <Time appointment={appointment} />
                <Assignee assignee={assignee} />
                <Private appointment={appointment} />
                <Tags
                  appointment={appointment}
                  allowedTags={allowedTags}
                  maxDuration={maxDuration}
                  assignee={assignee}
                  calendar={calendar}
                  change={change}
                />
              </FormSection>
            </div>
            <ListItem>
              <Logs format={logFormat} doc={appointment} />
              <Stamps
                fields={['removed', 'created', 'admitted', 'canceled']}
                doc={appointment} />
            </ListItem>
          </div>

          {
            !patient &&
              <div
                className='col-md-6'
                onMouseLeave={
                  dirty
                  ? handleSubmit(handleEditAppointment)
                  : identity
                }>
                <FormSection name='appointment'>
                  <AppointmentNote appointment={appointment} />
                </FormSection>
              </div>
          }

          {
            patient &&
              <div
                className='col-md-6'
                style={{ marginTop: -25 }}
                onMouseLeave={
                dirty
                ? handleSubmit(handleEditPatient)
                : identity
              }>
                <FormSection name='patient'>
                  <PatientNotes patient={patient} />
                  <Contacts patient={patient} />
                  <BirthdayFields collectInsuranceId />
                  <FormSection name='address'>
                    <AddressFields change={change} />
                  </FormSection>
                  <br />
                  <Reminders />
                  <TotalRevenue value={totalPatientRevenue} />
                </FormSection>
              </div>
          }
        </div>
      </form>
    )
  }
}

const loadingStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  width: '100%',
  top: 67,
  height: 2
}
