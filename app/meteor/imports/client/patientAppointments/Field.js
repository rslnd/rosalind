import React from 'react'
import debounce from 'lodash/debounce'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'

class DebouncedField extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: this.props.initialValue
    }

    const debounceMillis = 600

    this.debouncedUpdate = debounce(newValue =>
      this.props.onChange(newValue).catch(e => {
        Alert.error(__('ui.tryAgain'))
        this.setState({ value: null })
      })
      , debounceMillis)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e) {
    const { value } = e.target
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
    const style = {
      ...this.props.style,
      ...fieldStyle
    }

    const value = (this.state.value !== null
      ? this.state.value
      : this.props.initialValue) || ''

    return this.props.children({
      style,
      value,
      onChange: this.handleChange
    })
  }
}

export const Field = ({ ...props }) =>
  <DebouncedField {...props}>
    {props => <input {...props} />}
  </DebouncedField>

const fieldStyle = {
  outline: 0,
  border: 0,
  background: 'rgba(255, 255, 255, 0)'
}
