import React from 'react'

export const Icon = ({ name, spin }) => {
  if (spin) {
    return <i className={`fa fa-${name} fa-spin`}></i>
  } else {
    return <i className={`fa fa-${name}`}></i>
  }
}
