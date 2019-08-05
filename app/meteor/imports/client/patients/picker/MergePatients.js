import React from 'react'
import Alert from 'react-s-alert'
import { connect } from 'react-redux'
import { Button } from '@material-ui/core'
import { Icon } from '../../components/Icon'
import { compose, withProps, withHandlers } from 'recompose'
import { hasRole } from '../../../util/meteor/hasRole'
import { Meteor } from 'meteor/meteor'
import { isLikelySamePatient } from '../../../api/patients/methods/isLikelySamePatient'

export const MergePatients = compose(
  connect(state => ({
    selectedPatient: state.patientPicker.patient
  })),
  withProps(props => ({
    canMerge: props.selectedPatient && props.patient && hasRole(Meteor.userId(), ['admin', 'patients-merge']) && isLikelySamePatient(props.selectedPatient, props.patient)
  })),
  withHandlers({
    handleClick: props => e => {
      console.log(`[Patients] merge: ${props.selectedPatient._id} ${props.patient._id}`)
      Meteor.call('patients/deduplicate', {
        patientIds: [props.selectedPatient._id, props.patient._id]
      }, (err) => {
        if (err) {
          console.error(err)
          Alert.error('Failed to merge patients')
        } else {
          Alert.success('Zusammengefügt')
        }
      })
    }
  })
)(({ canMerge, handleClick }) =>
  !canMerge ? null
    : <Button
      onClick={e => {
        e.stopPropagation()
        handleClick()
      }}
      variant='outlined'
      size='small'
    >
      <Icon name='share-alt' flipHorizontal />
      &nbsp;
      Zusammenfügen
    </Button>
)
