import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import { Icon } from 'client/ui/components/Icon'

export const TinyButton = (props) => (
  <FlatButton
    {...props}
    style={{
      ...props.style,
      minWidth: 40
    }}
/>
)

export class InlineEdit extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      editing: false,
      value: this.props.value
    }

    this.setEditing = this.setEditing.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleAccept = this.handleAccept.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  setEditing () {
    this.setState({
      ...this.state,
      editing: true
    })
  }

  handleChange (e) {
    this.setState({
      ...this.state,
      value: e.target.value
    })
  }

  handleAccept () {
    this.setState({
      ...this.state,
      editing: false
    })

    this.props.onChange(this.state.value)
  }

  handleCancel () {
    this.setState({
      ...this.state,
      editing: false,
      value: this.props.value
    })
  }

  render () {
    if (!this.state.editing) {
      return <span>
        {this.props.children || (this.props.value && this.props.value.split('\n').map((t, i) => (
          <span key={i}>{t}<br /></span>
        )))}
        <TinyButton onClick={this.setEditing}>
          <Icon name="pencil" />
        </TinyButton>
      </span>
    } else {
      return <span>
        <TextField
          value={this.state.value}
          onChange={this.handleChange}
          autoFocus
          multiLine={!!this.props.rows}
          rows={this.props.rows || 1}
          name={this.props.label}
          floatingLabelText={this.props.label}
          />

        {this.props.rows && <br />}

        <TinyButton
          onClick={this.handleAccept}
          title={TAPi18n.__('ui.save')}>
          <Icon name="check" />
        </TinyButton>
        <TinyButton
          onClick={this.handleCancel}
          title={TAPi18n.__('ui.cancel')}>
          <Icon name="times" />
        </TinyButton>
      </span>
    }
  }
}
