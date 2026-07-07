import React from 'react'
import Alert from 'react-s-alert'
import { connect } from 'react-redux'
import { Button } from '@material-ui/core'
import { Icon } from '../../components/Icon'
import { compose, withProps, withHandlers } from 'recompose'
import { Meteor } from 'meteor/meteor'
import { isLikelySamePatient } from '../../../api/patients/methods/isLikelySamePatient'

const partnerName = p =>
  [p.lastName, p.firstName].filter(Boolean).join(' ')

export const MergePatients = compose(
  connect(state => ({
    selectedPatient: state.patientPicker.patient,
    options: state.patientPicker.options
  })),
  withProps(props => {
    // Find a patient this result is likely a duplicate of: either the patient
    // currently held in the picker, or any other patient in the same search
    // results. This way the button shows up whenever a probable duplicate is
    // visible, not only after a patient has been selected/held.
    const candidates = [
      props.selectedPatient,
      ...(props.options || [])
    ]

    const mergePartner = candidates.find(candidate =>
      isLikelySamePatient(props.patient, candidate)
    )

    return {
      mergePartner,
      // Every logged-in user may merge; no dedicated role required anymore.
      canMerge: Boolean(Meteor.userId() && props.patient && mergePartner)
    }
  }),
  withHandlers({
    handleClick: props => e => {
      console.log(`[Patients] merge: ${props.mergePartner._id} ${props.patient._id}`)
      Meteor.call('patients/deduplicate', {
        patientIds: [props.mergePartner._id, props.patient._id]
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
)(({ canMerge, mergePartner, handleClick }) =>
  !canMerge ? null
    : <span style={wrapStyle}>
      <small className='text-muted' style={hintStyle}>
        Mögliches Duplikat von {partnerName(mergePartner)}
      </small>
      <Button
        title={`Diese Person scheint doppelt angelegt zu sein (gleicher Name und Geburtstag wie ${partnerName(mergePartner)}). Klicken, um beide Karteien zu einer zusammenzuführen.`}
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
    </span>
)

const wrapStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6
}

const hintStyle = {
  whiteSpace: 'nowrap'
}
