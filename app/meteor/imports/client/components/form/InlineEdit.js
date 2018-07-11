import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Icon } from '../Icon'

export const TinyButton = (props) => (
  <Button
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
      hovering: false,
      editing: false,
      value
    }

    this.setEditing = this.setEditing.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
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
      value: e.target.value
    })
  }

  handleMouseEnter (e) {
    this.setState({
      hovering: true
    })
  }

  handleMouseLeave (e) {
    this.setState({
      hovering: false
    })

    if (this.props.submitOnMouseLeave) {
      this.handleAccept()
    }
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
    let style = { ...fieldStyle }
    if (this.props.fullWidth) {
      style = {
        ...style,
        display: 'inline-block',
        width: '100%'
      }
    }

    if (!this.state.editing) {
      return <span
        style={style}
        onClick={this.setEditing}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}>
        {
          !this.props.submitOnBlur && this.state.hovering &&
            <div className='pull-right'>
              <TinyButton
                onClick={this.setEditing}
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
      return <span onMouseLeave={this.handleMouseLeave}>
        <form onSubmit={this.handleAccept}>
          <TextField
            value={this.state.value}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            autoFocus
            multiline={!!(this.props.rows || this.props.rowsMax)}
            rows={this.props.rows || 1}
            rowsMax={this.props.rowsMax}
            placeholder={this.props.placeholder}
            name={this.props.label}
            label={this.props.label}
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
        </form>
      </span>
    }
  }
}

const fieldStyle = {
  cursor: 'pointer',
  display: 'inline-block'
}
