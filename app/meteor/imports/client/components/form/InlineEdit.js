import React from 'react'
import { __ } from '../../../i18n'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Icon } from '../Icon'
import { handleKeyPress } from './TextField'

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
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  componentDidUpdate (prevProps) {
    // Adopt an external value change (e.g. the same field edited elsewhere)
    // as long as we are not editing here. Prevents a stale internal value from
    // overwriting the change on save.
    if (!this.state.editing && prevProps.value !== this.props.value) {
      let value = this.props.value
      if (this.props.stringify) {
        value = this.props.stringify(value)
      }
      this.setState({ value })
    }
  }

  componentWillUnmount () {
    // If the component is unmounted while still editing, notify the parent so
    // that e.g. a panel does not stay stuck open
    if (this.state.editing && this.props.onEditingChange) {
      this.props.onEditingChange(false)
    }
  }

  setEditing () {
    this.setState({
      editing: true
    })

    if (this.props.onEditingChange) {
      this.props.onEditingChange(true)
    }
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

  handleAccept (e) {
    if (e) {
      e.preventDefault()
    }

    this.setState({
      editing: false
    })

    if (this.props.onEditingChange) {
      this.props.onEditingChange(false)
    }

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

    if (this.props.onEditingChange) {
      this.props.onEditingChange(false)
    }
  }

  handleBlur () {
    if (this.props.submitOnBlur) {
      this.handleAccept()
    }
  }

  handleKeyDown (e) {
    // ESC ends editing and discards the change
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault()
      this.handleCancel()
    }
  }

  render () {
    if (this.props.canEdit === false) {
      return this.props.children || this.props.value || null
    }

    let style = { ...defaultFieldStyle, ...(this.props.fieldStyle || {}) }
    let spanStyle = {}
    if (this.props.fullWidth) {
      const fullWidthStyle = {
        display: 'inline-block',
        width: '100%',
        lineHeight: '16.625px'
      }

      style = {
        ...style,
        ...fullWidthStyle
      }

      spanStyle = fullWidthStyle
    }

    if (!this.state.editing) {
      return <span
        style={style}
        onClick={this.setEditing}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}>
        {
          !this.props.submitOnBlur && !this.props.noUI && this.state.hovering &&
            <div className='pull-right'>
              <TinyButton
                onClick={this.setEditing}
                title={__('ui.edit')}>
                <Icon name='pencil-square-o' />
              </TinyButton>
            </div>
        }

        {this.props.children || (this.props.value && this.props.value.split('\n').map((t, i) => (
          <span style={this.props.lineStyle} key={i}>{t}<br /></span>
        ))) || (this.props.hidePlaceholder ? null : this.props.placeholder)}
      </span>
    } else {
      return <span style={spanStyle} onMouseLeave={this.handleMouseLeave}>
        {this.props.editingHeader}
        <form onSubmit={this.handleAccept}>
          <TextField
            value={this.state.value}
            onChange={this.handleChange}
            onKeyPress={this.props.submitOnEnter ? handleKeyPress(this.handleBlur) : null}
            onKeyDown={this.handleKeyDown}
            onBlur={this.handleBlur}
            onFocus={(e) => {
              // Place the caret at the end of the text instead of the beginning
              const end = e.target.value.length
              e.target.setSelectionRange(end, end)
            }}
            autoFocus
            multiline={!!(this.props.multiline || this.props.rows || this.props.rowsMax)}
            fullWidth={this.props.fullWidth}
            rows={this.props.rows}
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
                  title={__('ui.save')}>
                  <Icon name='check' />
                </TinyButton>
                <TinyButton
                  onClick={this.handleCancel}
                  title={__('ui.cancel')}>
                  <Icon name='times' />
                </TinyButton>
              </div>
          }
        </form>
      </span>
    }
  }
}

const defaultFieldStyle = {
  cursor: 'pointer',
  display: 'inline-block'
}
