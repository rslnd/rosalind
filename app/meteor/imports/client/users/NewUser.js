import React from 'react'
import { connect } from 'react-redux'
import { reduxForm, Field, formValueSelector } from 'redux-form'
import Button from '@material-ui/core/Button'
import Alert from 'react-s-alert'
import { ContentHeader } from '../components/ContentHeader'
import { Box } from '../components/Box'
import { __ } from '../../i18n'
import { Users } from '../../api/users'
import { Icon } from '../components/Icon'
import { TextField } from '../components/form/TextField'
import { withTracker } from '../components/withTracker'
import { subscribe } from '../../util/meteor/subscribe'
import { validate as validatePassword } from './ChangePasswordForm'
import { UserProfileFields } from './UserProfileForm'
import { usernameInitials, firstFreeUsername } from '../../api/users/methods/generateUsername'

const isTaken = username => !!Users.findOne({ username }, { removed: true })

// Only the fields the users/insert action accepts.
const INSERT_FIELDS = ['username', 'password', 'firstName', 'lastName', 'titlePrepend', 'titleAppend', 'employee', 'hiddenInReports', 'groupId']

class NewUserScreen extends React.Component {
  // Prefill the username from the name (initials, collision-suffixed) as long
  // as the admin hasn't edited it themselves.
  componentDidUpdate (prev) {
    const { firstName, lastName, username, change } = this.props

    if (username && username !== this.lastSuggestion) { this.edited = true }
    if (this.edited) { return }
    if (firstName === prev.firstName && lastName === prev.lastName) { return }

    const suggestion = firstFreeUsername(usernameInitials({ firstName, lastName }), isTaken)
    if (suggestion && suggestion !== username) {
      this.lastSuggestion = suggestion
      change('username', suggestion)
    }
  }

  render () {
    const { submitting, invalid, validating, pristine, handleSubmit } = this.props
    return (
      <div>
        <ContentHeader>
          <Icon name='user-plus' /> {__('users.thisNew')}
        </ContentHeader>
        <div className='content'>
          <div className='row'>
            <div className='col-md-12'>
              <Box title={__('users.profile')} type='primary'>
                <form onSubmit={handleSubmit}>
                  <UserProfileFields />

                  <Field
                    name='password'
                    component={TextField}
                    type='password'
                    label={__('users.password')}
                  />

                  <br /><br />

                  <Button
                    type='submit'
                    color='primary'
                    variant='contained'
                    fullWidth
                    disabled={submitting || invalid || validating || pristine}
                    onClick={handleSubmit}
                  >{
                      submitting || validating
                        ? <Icon name='refresh' spin />
                        : __('users.thisSave')
                    }</Button>
                </form>
              </Box>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const onSubmit = values => {
  const payload = {}
  INSERT_FIELDS.forEach(k => { if (values[k] !== undefined) { payload[k] = values[k] } })

  return Users.actions.insert.callPromise(payload)
    .then(() => Alert.success(__('ui.saved')))
    .catch((e) => {
      console.error(e)
      Alert.error(e.reason || e.message || __('ui.error'))
    })
}

const validateProfile = ({ username }) => {
  if (!username) {
    return { username: __('ui.required') }
  }
  if (Users.findOne({ username }, { removed: true })) {
    return { username: __('users.usernameTaken') }
  }
  return {}
}

// Password is required (min length enforced by validatePassword) so the new
// user can log in immediately.
const validate = values => ({
  ...validatePassword(values),
  ...validateProfile(values)
})

const selector = formValueSelector('newUser')
const withValues = connect(state => ({
  firstName: selector(state, 'firstName'),
  lastName: selector(state, 'lastName'),
  username: selector(state, 'username')
}))

const Form = reduxForm({
  form: 'newUser',
  validate,
  onSubmit
})(withValues(NewUserScreen))

export const NewUser = withTracker(() => {
  subscribe('users') // for username collision detection
  return {}
})(Form)
