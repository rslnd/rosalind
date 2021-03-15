import React from 'react'
import identity from 'lodash/identity'
import Button from '@material-ui/core/Button'
import { __ } from '../../../i18n'
import { compose, mapProps } from 'recompose'
import { updateEveryMs } from '../../components/updateEveryMs'

const primaryButtonStyle = {
  flexGrow: 1
}

const alternativeButtonStyle = {
  marginTop: 6,
  flexShrink: 1
}

// Disable buttons for some time after starting treatment
// to avoid double click immediately ending treatment
const waitMs = 1000
let lastClickAt = 0

const withClick = fn => e => {
  lastClickAt = new Date()
  fn(e)
}

const composer = props => {
  const disableButtons = lastClickAt >= (new Date() - waitMs)

  return {
    disableButtons,
    ...props
  }
}

const ActionButtonComponent = ({ appointment, isFirst, isLast, action, style = {}, canChangeWaitlistAssignee, handleChangeWaitlistAssignee, disableButtons }) => {
  const a = appointment
  const nextAction = [
    !a.treatmentStart && action('startTreatment', a._id),
    a.treatmentStart && !a.treatmentEnd && !isLast && {
      ...action('nextTreatment', a._id),
      alternativeAction: action('endTreatment', a._id, { alternative: true })
    },
    a.treatmentStart && !a.treatmentEnd && action('endTreatment', a._id)
  ].find(identity)

  const containerStyle = {
    ...style,
    display: 'flex',
    flexDirection: 'column'
  }

  return (nextAction &&
    <div className='text-center' style={containerStyle}>
      <Button
        style={primaryButtonStyle}
        variant={isFirst ? 'contained' : undefined}
        color={isFirst ? 'primary' : undefined}
        size='large'
        onClick={withClick(nextAction.fn)}
        disabled={disableButtons}
        fullWidth>
        {
          nextAction.title
        }
      </Button>
      {
        nextAction.alternativeAction &&
          <Button
            style={alternativeButtonStyle}
            size='small'
            onClick={withClick(nextAction.alternativeAction.fn)}
            disabled={disableButtons}
            fullWidth>
            {nextAction.alternativeAction.title}
          </Button>
      }
      {
        canChangeWaitlistAssignee &&
          <Button
            style={alternativeButtonStyle}
            size='small'
            onClick={withClick(() => handleChangeWaitlistAssignee({ appointmentId: a._id }))}
            disabled={disableButtons}
            fullWidth>
            {__('appointments.changeWaitlistAssignee')}
          </Button>
      }
    </div>) || null
}

export const ActionButton = compose(
  updateEveryMs({ ms: 1000 }),
  mapProps(composer)
)(ActionButtonComponent)
