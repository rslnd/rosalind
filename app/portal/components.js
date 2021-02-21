import { Field, useField } from 'formik'

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

export const Checkbox = ({ label, ...props }) => {
  const [field, meta] = useField({ ...props, type: 'checkbox' })
  return <>
    <label
      className='label'
      htmlFor={field.name}
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
