import React from 'react'
import Alert from 'react-s-alert'
import { Icon } from '../components/Icon'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css'

const AlertIcon = ({ classNames, icon }) => (
  <div
    style={{
      display: 'inline-block',
      minWidth: 20,
      order: 1
    }}>
    {
      icon ||
        (classNames.includes('s-alert-success') && <Icon name='check-circle' />) ||
        (classNames.includes('s-alert-error') && <Icon name='exclamation-circle' />) ||
        (classNames.includes('s-alert-warning') && <Icon name='exclamation-triangle' />)
    }
  </div>
)

const CustomAlert = ({ classNames, id, styles, message, handleClose, customFields }) => (
  <div
    className={classNames}
    id={id}
    style={{
      display: 'flex',
      bottom: 0,
      left: 0,
      width: 230,
      zIndex: 400,
      paddingLeft: 17.457,
      paddingTop: 15,
      paddingBottom: 15
    }}>
    <AlertIcon {...{ classNames, icon: customFields.icon }} />
    <span
      style={{
        order: 2,
        flexGrow: 1
      }}>
      {message}
      &nbsp;{customFields.emoji || null}
    </span>
    <span
      className='s-alert-close'
      onClick={handleClose}
      style={{ top: 15, right: 10 }} />
  </div>
)

export const Alerts = () => (
  <Alert
    effect='stackslide'
    position='bottom-left'
    timeout={5000}
    html={false}
    onRouteClose={false}
    stack={false}
    offset={0}
    beep={false}
    contentTemplate={CustomAlert}
  />
)
