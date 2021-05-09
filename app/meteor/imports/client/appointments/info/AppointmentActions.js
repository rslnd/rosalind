import React from 'react'
import { compose, withState, withHandlers } from 'recompose'
import MuiButton from '@material-ui/core/Button'
import { __ } from '../../../i18n'
import { Icon } from '../../components/Icon'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { currentState } from '../../../api/appointments/states'

const buttons = ({ admittedIsTreated }) => ({
  setQueued: { icon: 'circle', primary: true },
  setAdmitted: { icon: admittedIsTreated ? 'check' : 'angle-double-right', primary: true },
  setDismissed: { icon: 'circle-o', primary: true },
  startTreatment: { icon: 'circle-o-notch', primary: true },
  endTreatment: { icon: 'check', primary: true },
  setNoShow: { icon: 'times' },
  setCanceled: { icon: 'minus' },
  unsetCanceled: { icon: 'minus' },
  viewInCalendar: { icon: 'calendar' },
  softRemove: { icon: 'trash-o' },
  move: { icon: 'arrows' },
  searchForPatient: { icon: 'search' }
})

// Usage: <Btn.admit {...props} />
const Btn = Object.keys(buttons({})).reduce((acc, k) => ({
  ...acc,
  [k]: props =>
    <Button
      {...props}
      {...buttons(props.calendar || {})[k]}
      name={k}
      onClick={() => props.handleClick(k)}
    />
}), {})

const Button = ({ icon, name, primary, ...props }) => {
  const onClick = props[name]
  if (!onClick) { console.error('Button', name, 'has no click handler') }

  return <MuiButton
    variant={primary ? 'contained' : null}
    style={primary ? primaryButtonStyle : buttonStyle}
    onClick={onClick}
  >
    <Icon name={icon} />
    &emsp;
    {__('appointments.' + name)}
  </MuiButton>
}

const buttonStyle = {
  opacity: 0.75,
  marginRight: 20,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 30
}

const primaryButtonStyle = {
  ...buttonStyle,
  opacity: 0.9,
  backgroundColor: '#fff'
}

const menuButtonStyle = {
  ...buttonStyle,
  opacity: 0.3,
  marginRight: 20,
  height: 37,
  width: 40,
  minWidth: 55
}

export const AppointmentActions = compose(
  withState('anchor', 'setAnchor', null),
  withHandlers({
    handleMenuOpen: props => e => props.setAnchor(e.currentTarget),
    handleMenuClose: props => e => props.setAnchor(null),
    handleClick: props => actionName => {
      console.log(actionName)
      props.setAnchor(null)
    }
  })
)((props) => {
  const {
    appointment,
    anchor,
    handleMenuOpen,
    handleMenuClose,
    viewInCalendar,
    move,
    searchForPatient,
    calendar
  } = props

  const next = appointment && currentState(appointment, calendar)

  if (appointment && !next) {
    console.log(appointment)
    throw new Error(`No next state for appoitment ${appointment._id}`)
  }

  const primaryActions = appointment && next.primaryActions && next.primaryActions.map(n => Btn[n])
  const secondaryActions = appointment && next.secondaryActions

  return <div style={containerStyle}>
    {appointment
      ? <div style={leftStyle}>
        {
          primaryActions && primaryActions.map((NextAction, i) =>
            <NextAction
              key={i}
              {...props}
            />
          )
        }

        {viewInCalendar && <Btn.viewInCalendar {...props} />}

        {
          secondaryActions &&
          <MuiButton
            variant='outlined'
            style={menuButtonStyle}
            onClick={handleMenuOpen}
          >
            <Icon name='ellipsis-h' />
          </MuiButton>
        }

        {
          secondaryActions && <Menu
            open={!!anchor}
            anchorEl={anchor}
            getContentAnchorEl={null}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
          >
            {
              secondaryActions.map(a =>
                <MenuItem
                  key={a}
                  onClick={() => {
                    handleMenuClose()
                    props[a]()
                  }}
                >
                  <span style={menuIconStyle}>
                    {buttons(calendar)[a] ? <Icon name={buttons(calendar)[a].icon} /> : null}
                  </span>
                  {__('appointments.' + a)}
                </MenuItem>
              )
            }
          </Menu>
        }
      </div>
      : <div style={leftStyle}>
        &nbsp;
      </div>
    }

    <div style={rightStyle}>
      {searchForPatient && <Btn.searchForPatient {...props} />}
      {appointment && <Btn.softRemove {...props} />}
      {appointment && move && <Btn.move {...props} />}
    </div>
  </div>
})

const menuIconStyle = {
  display: 'inline-block',
  width: 30
}

const containerStyle = {
  width: '100%',
  display: 'flex'
}

const leftStyle = {
  flexGrow: 1,
  display: 'flex',
  flexWrap: 'nowrap',
  minWidth: 100
}

const rightStyle = {
  flexShrink: 1,
  display: 'flex',
  flexWrap: 'nowrap',
  textAlign: 'right',
  minWidth: 100
}

AppointmentActions.displayName = 'AppointmentActions'
