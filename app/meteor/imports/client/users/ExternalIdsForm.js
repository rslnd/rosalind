import React from 'react'
import Alert from 'react-s-alert'
import { compose, mapProps } from 'recompose'
import Button from '@material-ui/core/Button'
import { reduxForm, Field } from 'redux-form'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'
import { TextField } from '../components/form/TextField'
import idx from 'idx'
import { Users } from '../../api/users'

const onSubmit = ({ eoswinId }, dispatch, props) =>
  Users.actions.updateProfile.callPromise({
    userId: props.user._id,
    external: {
      ...props.user.external || {},
      eoswin: {
        ...idx(props, _ => _.user.external.eoswin || {}),
        id: eoswinId
      }
    }
  }).then(() => {
    Alert.success(__('ui.saved'))
  }).catch(e => {
    console.error(e)
    Alert.error(__('ui.error'))
  })

const Fields = ({ handleSubmit, submitting, invalid, validating, pristine, user }) =>
  <form onSubmit={handleSubmit}>

    <small>EOSWin Menü: <i>Ordination → Arztwechsel</i></small>

    <Field
      name='eoswinId'
      component={TextField}
      label='EOSWin ID (A..)'
      placeholder='A9'
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
          : 'Speichern'
      }</Button>
  </form>

export const ExternalIdsForm = compose(
  mapProps(props => ({
    ...props,
    initialValues: {
      eoswinId: idx(props, _ => _.user.external.eoswin.id)
    }
  })),
  reduxForm({
    form: 'externalIds',
    enableReinitialize: true,
    onSubmit
  })
)(Fields)
