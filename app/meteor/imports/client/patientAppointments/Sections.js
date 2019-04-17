import React from 'react'
import { compose, withState, withProps, withHandlers, withPropsOnChange } from 'recompose'
import { Icon } from '../components/Icon'
import { __ } from '../../i18n'
import { dateColumnStyle } from './Info'
import { AppointmentsList, currentAppointmentStyle } from './Appointment'

export const Oldest = () =>
  <div style={separatorHeadingStyle}>
    {__('appointments.oldestAppointment')}
  </div>

const separatorHeadingStyle = {
  paddingTop: 55,
  paddingLeft: dateColumnStyle.width + 12 + 12, // Fake same column as assignee name
  opacity: 0.3
}

export const Current = () =>
  <div style={currentStyle}>
    {__('appointments.thisCurrent')}
  </div>

const currentStyle = {
  ...separatorHeadingStyle,
  paddingLeft: separatorHeadingStyle.paddingLeft + currentAppointmentStyle.paddingLeft,
  paddingTop: 25
}

export const Future = compose(
  withState('expanded', 'setExpanded', false),
  withPropsOnChange(
    ['show'],
    props => props.setExpanded(false)
  ),
  withProps(props => {
    const count = props.futureAppointments.length
    if (count === 0) { return null }

    const key = [
      'appointments.futureToggle',
      props.expanded ? 'Hide' : 'Show'
    ].join('')

    const icon = props.expanded ? 'caret-down' : 'caret-right'

    return {
      toggleLabel: __(key, { count }),
      icon
    }
  }),
  withHandlers({
    handleExpand: props => e => {
      if (props.futureAppointments.length > 0) {
        props.setExpanded(!props.expanded)
        props.scrollToBottom()
      }
    }
  })
)(({
  expanded,
  handleExpand,
  toggleLabel,
  futureAppointments,
  fullNameWithTitle,
  icon
}) =>
  <>
    <div
      style={
        expanded
          ? futureHeaderExpandedStyle
          : futureHeaderStyle
      }
      onClick={handleExpand}
    >
      {icon && <Icon name={icon} style={caretStyle} />}&nbsp;{toggleLabel}
    </div>
    {
      expanded &&
      <AppointmentsList
        appointments={futureAppointments}
        fullNameWithTitle={fullNameWithTitle}
      />
    }
  </>
)

const caretStyle = {
  marginRight: 4
}

const futureHeaderStyle = {
  ...separatorHeadingStyle,
  paddingTop: 25,
  height: 80
}

const futureHeaderExpandedStyle = {
  ...futureHeaderStyle,
  height: 46
}
