import React from 'react'
import Button from '@material-ui/core/Button'

export class ToggleField extends React.Component {
  constructor (props) {
    super(props)

    this.currentIndex = this.currentIndex.bind(this)
    this.toggle = this.toggle.bind(this)
  }

  currentIndex () {
    const possibleValues = this.props.values.map((v) => v.value)
    let currentIndex = possibleValues.indexOf(this.props.input.value)
    if (currentIndex === -1) {
      currentIndex = 0
    }
    return currentIndex
  }

  componentDidMount () {
    this.props.input.onChange(this.props.input.value || this.props.values[0].value)
  }

  toggle () {
    const newIndex = 1 - this.currentIndex()

    this.props.input.onChange(this.props.values[newIndex].value)
    this.props.onChange && this.props.onChange()
  }

  render () {
    if (this.props.button === false) {
      return <div
        onClick={this.toggle}
        style={this.props.style}>
        {this.props.values[this.currentIndex()].label}</div>
    } else {
      return <Button
        onClick={this.toggle}
        style={this.props.style}>
        {this.props.values[this.currentIndex()].label}</Button>
    }
  }
}
