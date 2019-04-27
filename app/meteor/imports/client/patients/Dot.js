import React from 'react'
import { __ } from '../../i18n'
import injectSheet from 'react-jss'

const dotStyle = {
  dot: {
    width: 30,
    height: 30,
    minWidth: 30,
    minHeight: 30,
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
    title={banned ? __('patients.banned') : __('patients.toggleBanned')} /> || null
))
