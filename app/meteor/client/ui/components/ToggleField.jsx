import React from 'react'
import FlatButton from 'material-ui/FlatButton'

export class ToggleField extends React.Component {
  constructor (props) {
    super(props)

    const possibleValues = this.props.values.map((v) => v.value)
    let currentIndex = possibleValues.indexOf(this.props.input.value)
    if (currentIndex === -1) {
      currentIndex = 0
    }

    this.state = { currentIndex }
    this.toggle = this.toggle.bind(this)
  }

  componentDidMount () {
    this.props.input.onChange(this.props.input.value || this.props.values[0].value)
  }

  toggle () {
    const newIndex = 1 - this.state.currentIndex

    this.setState({
      currentIndex: newIndex
    })

    this.props.input.onChange(this.props.values[newIndex].value)
  }

  render () {
    return <FlatButton
      onClick={this.toggle}
      style={{ ...this.props.style }}>
      {this.props.values[this.state.currentIndex].label}</FlatButton>
  }
}
