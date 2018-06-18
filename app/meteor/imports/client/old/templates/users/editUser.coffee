import './editUser.tpl.jade'
import map from 'lodash/map'
import Alert from 'react-s-alert'
import { Users } from '../../../../api/users'
import { Groups } from '../../../../api/groups'
import { UpdatePassword, UpdateRoles } from '../../../../api/users/schema/actions'
import schema from '../../../../api/users/schema/users'

Template.editUser.helpers
  user: ->
    _id = window.location.pathname.split('/')[2]
    Users.findOne(_id)

  collection: ->
    Users

  schema: ->
    schema

  updatePassword: ->
    UpdatePassword

  updateRoles: ->
    UpdateRoles

  groups: ->
    map(Groups.methods.all(), (g) -> { label: g.name, value: g._id })

AutoForm.hooks
  editUserForm:
    onSuccess: ->
      window.__deprecated_history_push('/users/')
      Alert.success(TAPi18n.__('users.editSuccess'))

  updatePasswordUserForm:
    onSuccess: ->
      window.__deprecated_history_push('/users/')
      Alert.success(TAPi18n.__('users.editSuccess'))

  updateRolesUserForm:
    onSuccess: ->
      window.__deprecated_history_push('/users/')
      Alert.success(TAPi18n.__('users.editSuccess'))
