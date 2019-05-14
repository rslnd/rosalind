import React from 'react'
import debounce from 'lodash/debounce'
import identity from 'lodash/identity'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import Cleave from 'cleave.js/react'
import { DayField } from '../components/form/DayField'
import { withHandlers, compose, lifecycle, withState } from 'recompose'

const fieldStyle = {
  outline: 0,
  border: 0,
  background: 'rgba(255, 255, 255, 0)',
  width: '100%'
}

export const PlainField = ({ style, ...props }) =>
  <input
    style={style ? { ...fieldStyle, ...style } : fieldStyle}
    {...props}
  />

class DebouncedField extends React.Component {
  constructor(props) {
    super(props)

    const {
      initialValue,
      onChange,
      parse,
      shouldUpdate
    } = props

    this.state = {
      value: initialValue
    }

    const debounceMillis = 850

    const doParse = parse || identity

    this.debouncedUpdate = debounce(newValue => {
      if (shouldUpdate && !shouldUpdate(newValue)) { return }

      return onChange(doParse(newValue)).catch(e => {
        console.error(e)
        Alert.error(__('ui.tryAgain'))
        this.setState({ value: null })
      })
    }, debounceMillis)

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e) {
    const value = (e && e.target) ? e.target.value : e
    this.setState({ value })
    this.debouncedUpdate(value)
  }

  // Reset state on props change
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.initialValue !== this.props.initialValue) {
      this.setState({
        value: null
      })
    }
  }

  componentWillUnmount() {
    this.debouncedUpdate.flush()
  }

  render() {
    const {
      style,
      initialValue,
      children,
      parse,
      format,
      shouldUpdate,
      ...restProps
    } = this.props

    const combinedStyle = {
      ...fieldStyle,
      ...style
    }

    const doFormat = format || identity

    const value = (this.state.value !== null
      ? this.state.value
      : doFormat(initialValue)) || ''

    return children({
      ...restProps,
      style: combinedStyle,
      value,
      onChange: this.handleChange
    })
  }
}

export const Money = ({ ...props }) =>
  <DebouncedField
    {...props}
    parse={parseMoney}
  >
    {props =>
      <Cleave
        options={moneyFormat}
        {...props}
      />
    }
  </DebouncedField>

const moneyFormat = {
  prefix: '€ ',
  numeral: true,
  numeralPositiveOnly: true,
  numeralDecimalMark: ',',
  delimiter: '.'
}

const parseMoney = v => {
  const parsed = parseFloat(v
    .replace(moneyFormat.prefix, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  )

  if (isNaN(parsed)) {
    return null
  } else {
    return parsed
  }
}

export const Day = ({ ...props }) =>
  <DebouncedField
    {...props}
  >
    {({ onChange, value, ...props }) =>
      <DayField
        input={{ value, onChange }}
        {...props}
      />
    }
  </DebouncedField>

export const Field = ({ ...props }) =>
  <DebouncedField {...props}>
    {props => <input {...props} />}
  </DebouncedField>

class AutogrowTextarea extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.handleInput = this.handleInput.bind(this)
  }

  autogrow (el) {
    el.style.height = '' // Force reset to allow shrinking
    el.style.height = el.scrollHeight + 'px'
  }

  handleInput (e) {
    this.autogrow(e.currentTarget)
    if (this.props.onInput) { this.props.onInput(e) }
  }

  componentDidMount () {
    const ref = this.ref.current
    this.autogrow(ref)
  }

  render () {
    const { value } = this.props

    // Override default of 2 rows when empty
    const rows = (value && value.split('\n').length) || 1

    return <textarea
      ref={this.ref}
      rows={rows}
      {...this.props}
      value={value || ''}
      onInput={this.handleInput}
    />
  }
}

export const Textarea = ({ ...props }) =>
  <DebouncedField {...props}>
    {props =>
      <AutogrowTextarea
        {...props}
      />
    }
  </DebouncedField>

export const InsuranceId = ({ ...props }) =>
  <DebouncedField
    {...props}
    parse={parseInsuranceId}
  >
    {props =>
      <Cleave
        options={insuranceIdFormat}
        {...props}
      />
    }
  </DebouncedField>

const insuranceIdFormat = {
  blocks: [4, 6],
  delimiter: ' '
}

const parseInsuranceId = v =>
  (v || '').replace(/\s/g, '')
