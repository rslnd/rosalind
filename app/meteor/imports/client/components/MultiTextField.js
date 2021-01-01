import React from 'react'
import Creatable from 'react-select/Creatable'

const components = {
  DropdownIndicator: null
}

const toOption = label => ({
  label,
  value: label
})

export class MultiTextField extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      inputValue: '',
      value: (this.props.initialValue || []).map(toOption)
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  handleChange (value) {
    this.setState({
      value
    })

    this.props.onChange(value.map(v => v.value))
  }

  handleInputChange (inputValue) {
    this.setState({ inputValue })
  }

  handleKeyDown (e) {
    switch (e.key) {
      case 'Enter':
      case 'Tab':
      case ',':
      case '.':
      case ';':
        const { inputValue, value } = this.state

        this.handleChange([
          ...value,
          toOption(inputValue)
        ])

        this.setState({
          inputValue: ''
        })

        e.preventDefault()
    }
  }

  render () {
    return <Creatable
      components={components}
      inputValue={this.state.inputValue}
      onChange={this.handleChange}
      onInputChange={this.handleInputChange}
      onKeyDown={this.handleKeyDown}
      value={this.state.value}
      isMulti
      isClearable
      menuIsOpen={false}
    />
  }
}
