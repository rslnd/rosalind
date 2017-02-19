import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import { Icon } from 'client/ui/components/Icon'
import styles from './inlineEditStyles'

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
      return <div
        className={styles.field}
        onClick={this.setEditing}>
        <div className="pull-right">
          <TinyButton
            onClick={this.setEditing}
            className={styles.startEdit}
            title={TAPi18n.__('ui.edit')}>
            <Icon name="pencil-square-o" />
          </TinyButton>
        </div>

        {this.props.children || (this.props.value && this.props.value.split('\n').map((t, i) => (
          <span key={i}>{t}<br /></span>
        ))) || this.props.placeholder}
      </div>
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

        <div className="pull-right">
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
        </div>
      </span>
    }
  }
}
