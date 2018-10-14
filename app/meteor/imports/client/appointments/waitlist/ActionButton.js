import React from 'react'
import identity from 'lodash/identity'
import Button from '@material-ui/core/Button'
import { __ } from '../../../i18n'

const primaryButtonStyle = {
  flexGrow: 1
}

const alternativeButtonStyle = {
  marginTop: 6,
  flexShrink: 1
}

export const ActionButton = ({ appointment, isFirst, isLast, action, style = {}, canChangeWaitlistAssignee, handleChangeWaitlistAssignee }) => {
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

  return nextAction &&
    <div className='text-center' style={containerStyle}>
      <Button
        style={primaryButtonStyle}
        variant={isFirst ? 'contained' : undefined}
        color={isFirst ? 'primary' : undefined}
        size='large'
        onClick={nextAction.fn}
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
            onClick={nextAction.alternativeAction.fn}
            fullWidth>
            {nextAction.alternativeAction.title}
          </Button>
      }
      {
        canChangeWaitlistAssignee &&
          <Button
            style={alternativeButtonStyle}
            size='small'
            onClick={() => handleChangeWaitlistAssignee({ appointmentId: a._id })}
            fullWidth>
            {__('appointments.changeWaitlistAssignee')}
          </Button>
      }
    </div> || null
}
