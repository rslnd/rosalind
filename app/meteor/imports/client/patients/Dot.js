import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import injectSheet from 'react-jss'

const dotStyle = {
  dot: {
    width: 30,
    height: 30,
    margin: 3,
    backgroundColor: '#f2f2f2',
    borderRadius: '100%',
    cursor: 'pointer',
    '&:hover': {
      border: '1px dashed #ccc'
    }
  }
}

export const Dot = injectSheet(dotStyle)(({ classes, banned, onClick }) => (
  <div
    className={classes.dot}
    onClick={onClick}
    style={{ backgroundColor: banned && 'black' }}
    title={banned ? TAPi18n.__('patients.banned') : TAPi18n.__('patients.toggleBanned')} /> || null
))
