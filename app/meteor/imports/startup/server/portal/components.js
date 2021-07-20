import React from 'react'

export const Required = () =>
  <span style={requiredStyle}>*</span>

export const requiredStyle = {
  display: 'inline-block',
  paddingLeft: 3,
  paddingRight: 3,
  color: '#777'
}

export const Input = ({ name, label, required, ...props }) =>
  <div>
    <label
      className='label'
      htmlFor={name}
    >
      <span>{label}</span>
      {required && <Required />}
    </label>
    <input
      className='textfield'
      name={name}
      id={name}
      {...props}
    />
  </div>

export const Checkbox = ({ name, label, props }) =>
  <>
    <label
      className='label'
      htmlFor={name}
    >
      <input
        type='checkbox'
        name={name}
        id={name}
        {...props}
      />
      {label}
    </label>
  </>

export const Radio = ({ name, value, label, props }) =>
  <div>
    <label htmlFor={value}>
      <input
        type='radio'
        id={name}
        name={name}
        {...props}
      />
      {label}
    </label>
  </div>

export const Section = ({ children }) =>
  <div style={{ paddingTop: 16 }}>
    {children}
  </div>
