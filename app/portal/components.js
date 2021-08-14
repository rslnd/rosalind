import { Component } from 'react'
import { Field, useField, useFormikContext } from 'formik'
import Cleave from 'cleave.js/react'

export const errorMessage = 'Hoppla, das hätte nicht passieren dürfen. Es ist ein technischer Fehler aufgetreten. Bitte entschuldigen Sie die Unannehmlichkeiten. Sie können uns telefonisch kontaktieren. Vielen Dank!'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <p>
        <b>{errorMessage}</b>
      </p>
    }

    return this.props.children
  }
}

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
    <Field
      type='text'
      className='textfield'
      name={name}
      id={name}
      {...props}
    />
  </div>

export const CleaveInput = ({ name, label, required, ...props }) => {
  const { handleChange } = useFormikContext()
  return <div>
    <label
      className='label'
      htmlFor={name}
    >
      <span>{label}</span>
      {required && <Required />}
    </label>
    <Cleave
      name={name}
      id={name}
      className='textfield'
      onChange={e => {
        e.target.value = e.target.rawValue
        handleChange(e)
      }}
      {...props}
    />
  </div>
}



export const Checkbox = ({ label, ...props }) => {
  const [field, meta] = useField({ ...props, type: 'checkbox' })
  return <>
    <label
      className='label'
      htmlFor={field.id}
    >
      <input
        type='checkbox'
        {...field}
        {...props}
      />
      {label}
    </label>
  </>
}

export const Radio = ({ label, labelStyle, checkedLabelStyle, labelInnerStyle, ...props }) => {
  const [ field, meta ] = useField({ ...props, type: 'radio' })
  return <div>
    <label
      htmlFor={field.id}
      style={field.checked ? checkedLabelStyle : labelStyle}
    >
      <input
        type='radio'
        {...field}
        {...props}
      />
      <span style={labelInnerStyle}>
        {label}
      </span>

    </label>
  </div>
}

export const Select = ({ label, children, ...props }) => {
  const [field, meta] = useField(props)
  return <div>
    <label htmlFor={field.name}>{label}</label><br />
    <select
      className='textfield'
      {...field}
      {...props}
    >
      {children}
    </select>
  </div>
}

export const Section = ({ children }) =>
  <div style={{ paddingTop: 16 }}>
    {children}
  </div>
