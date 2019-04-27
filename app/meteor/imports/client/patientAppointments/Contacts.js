import React from 'react'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import Alert from 'react-s-alert'
import { compose, withHandlers, withProps } from 'recompose'
import { PlainField } from './Field'
import { Icon } from '../components/Icon'
import { Button } from '@material-ui/core'
import { Patients } from '../../api/patients'
import { __ } from '../../i18n'
import { Meteor } from 'meteor/meteor'

const newContact = channel => ({
  channel,
  value: '',
  addedBy: Meteor.userId(),
  addedAt: new Date()
})

export class Contacts extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      tempContacts: null
    }

    this.setTempContacts = this.setTempContacts.bind(this)
    this.persist = this.persist.bind(this)
    this.debouncedPersist = debounce(this.persist, 850)
  }

  // Reset state on props change
  componentDidUpdate(prevProps) {
    if (this.state.tempContacts &&
      (prevProps._id !== this.props._id ||
        !isEqual(prevProps.contacts, this.props.contacts))) {
      this.setState({
        tempContacts: null
      })
    }
  }

  persist() {
    const contacts = this.state.tempContacts
      .filter(c => (c.value || c.noConsent || c.hasNone))
      .map(({ i, ...rest }) => ({ ...rest }))
    const patientId = this.props._id
    Patients.actions.setContacts.callPromise({ patientId, contacts }).then(() => {
      this.setState({ tempContacts: null })
      Alert.success(__('ui.saved'))
    }).catch(e => {
      console.error(e)
      Alert.error(__('ui.tryAgain'))
    })
  }

  setTempContacts(tempContacts, { persist = true } = {}) {
    this.setState({
      tempContacts: tempContacts.map((c, i) => ({ ...c, i }))
    })
    if (persist) {
      this.debouncedPersist()
    }
  }

  render() {
    const { contacts } = this.props
    const { tempContacts } = this.state

    const channels = ['Phone', 'Email']
    channels.map(channel => {
      if (!contacts.find(c => c.channel === channel)) {
        contacts.push({ ...newContact(channel) })
      }
    })

    const allContacts = (tempContacts || contacts.map((c, i) => ({ ...c, i })))

    const props = {
      tempContacts,
      allContacts,
      persist: this.persist,
      setTempContacts: this.setTempContacts
    }

    return <div>
      <ContactsList
        channel='Phone'
        {...props}
      />
      <ContactsList
        channel='Email'
        {...props}
      />
    </div>
  }
}

const ContactsList = compose(
  withProps(props => {
    const contacts = props.allContacts.filter(c => c.channel === props.channel)
    return { contacts }
  }),
  withHandlers({
    handleAdd: props => (i, channel) => e => props.setTempContacts([
      newContact(channel),
      ...(props.tempContacts || props.allContacts)
    ], { persist: false }),
    handleRemove: props => i => e => props.setTempContacts(
      (props.tempContacts || props.allContacts).filter(c => c.i !== i)
    ),
    handleChange: props => i => e => props.setTempContacts(
      (props.tempContacts || props.allContacts).map(c =>
        c.i === i
          ? { ...c, value: e.target.value }
          : c
      )
    ),
    handleChangeConsent: props => i => ({ noConsent, hasNone, value }) => props.setTempContacts(
      (props.tempContacts || props.allContacts).map(c =>
        c.i === i
          ? { ...c, noConsent, hasNone, value }
          : c
      )
    )
  })
)(({ contacts, handleAdd, handleRemove, handleChange, handleChangeConsent }) =>
  <div>
    {contacts.map((c, ix) =>
      <Contact
        key={c.i}
        onAdd={(ix === 0 && handleAdd(c.i, c.channel))}
        onRemove={handleRemove(c.i)}
        onChange={handleChange(c.i)}
        onChangeConsent={handleChangeConsent(c.i)}
        {...c}
      />
    )}
  </div>
)

const Contact = ({ channel, onChange, onChangeConsent, value, noConsent, hasNone, ...rest }) =>
  <div style={rowStyle}>
    <Icon name={icon(channel)} />
    {
      (hasNone || noConsent)
        ? <Nope hasNone={hasNone} noConsent={noConsent} />
        : <PlainField value={value} onChange={onChange} />
    }
    <Actions {...rest} />
    {
      !value &&
      <Consent onChangeConsent={onChangeConsent} />
    }
  </div>

const rowStyle = {
  display: 'flex'
}

const icon = channel =>
  channel === 'Phone'
    ? 'phone'
    : 'envelope-open-o'

const Actions = ({ onAdd, onRemove }) =>
  <div style={actionsStyle}>
    <Button style={buttonStyle} onClick={onRemove}><Icon name='minus' style={buttonIconStyle} /></Button>
    {
      onAdd
        ? <Button style={buttonStyle} onClick={onAdd}><Icon name='plus' style={buttonIconStyle} /></Button>
        : <div style={buttonStyle} />
    }
  </div>

const actionsStyle = {
  display: 'flex'
}

const buttonStyle = {
  width: 25,
  height: 25,
  marginRight: 10
}

const buttonIconStyle = {
  fontSize: '16px'
}

const Consent = withHandlers({
  setHasNone: props => e => {
    e.preventDefault()
    props.onChangeConsent({ hasNone: true, value: 'hasNone' })
  },
  setNoConsent: props => e => {
    e.preventDefault()
    props.onChangeConsent({ noConsent: true, value: 'noConsent' })
  }
})(({ setHasNone, setNoConsent }) =>
  <div>
    PatientIn <a href='#' onClick={setHasNone}>hat keine</a> oder <a href='#' onClick={setNoConsent}>möchte sie nicht hergeben</a>
  </div>
)

const Nope = ({ hasNone, noConsent }) =>
  <div>
    {hasNone && 'hat keine'}
    {noConsent && 'möchte nicht hergeben'}
  </div>
