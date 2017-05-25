import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import { Icon } from '../Icon'
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

    let value = this.props.value
    if (this.props.stringify) {
      value = this.props.stringify(value)
    }

    this.state = {
      editing: false,
      value
    }

    this.setEditing = this.setEditing.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleAccept = this.handleAccept.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
  }

  setEditing () {
    this.setState({
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
      editing: false
    })

    let originalValue = this.props.value

    if (this.props.stringify) {
      originalValue = this.props.stringify(originalValue)
    }

    if (this.state.value !== originalValue) {
      let finalValue = this.state.value

      if (this.props.parse) {
        finalValue = this.props.parse(finalValue)
      }

      this.props.onChange(finalValue)
    }
  }

  handleCancel () {
    this.setState({
      editing: false,
      value: this.props.value
    })
  }

  handleBlur () {
    if (this.props.submitOnBlur) {
      this.handleAccept()
    }
  }

  render () {
    let style = {}
    if (this.props.fullWidth) {
      style = {
        display: 'inline-block',
        width: '100%'
      }
    }

    if (!this.state.editing) {
      return <span
        className={styles.field}
        style={style}
        onClick={this.setEditing}>
        {
          !this.props.submitOnBlur &&
            <div className='pull-right'>
              <TinyButton
                onClick={this.setEditing}
                className={styles.startEdit}
                title={TAPi18n.__('ui.edit')}>
                <Icon name='pencil-square-o' />
              </TinyButton>
            </div>
        }

        {this.props.children || (this.props.value && this.props.value.split('\n').map((t, i) => (
          <span key={i}>{t}<br /></span>
        ))) || this.props.placeholder}
      </span>
    } else {
      return <span>
        <TextField
          value={this.state.value}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          autoFocus
          multiLine={!!this.props.rows}
          rows={this.props.rows || 1}
          name={this.props.label}
          floatingLabelText={this.props.label}
          />

        {
          !this.props.submitOnBlur &&
            <div className='pull-right'>
              <TinyButton
                onClick={this.handleAccept}
                title={TAPi18n.__('ui.save')}>
                <Icon name='check' />
              </TinyButton>
              <TinyButton
                onClick={this.handleCancel}
                title={TAPi18n.__('ui.cancel')}>
                <Icon name='times' />
              </TinyButton>
            </div>
        }
      </span>
    }
  }
}
