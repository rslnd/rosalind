import React from 'react'
import identity from 'lodash/identity'
import Button from 'material-ui/Button'

const primaryButtonStyle = {
  flexGrow: 1
}

const alternativeButtonStyle = {
  marginTop: 6,
  flexShrink: 1
}

export const ActionButton = ({ appointment, isFirst, isLast, action, style = {} }) => {
  const a = appointment
  const nextAction = [
    !a.treatmentStart && action('startTreatment', a),
    a.treatmentStart && !a.treatmentEnd && !isLast && {
      ...action('nextTreatment', a),
      alternativeAction: action('endTreatment', a, { alternative: true })
    },
    a.treatmentStart && !a.treatmentEnd && action('endTreatment', a)
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
        variant={isFirst ? 'raised' : undefined}
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
    </div> || null
}
