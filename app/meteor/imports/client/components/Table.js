import idx from 'idx'
import React from 'react'
import Portal from 'react-portal'
import isEqual from 'lodash/isEqual'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'
import { SwatchesPicker } from 'react-color'
import { Icon } from './Icon'

const ColHeader = ({ header }) => {
  if (typeof header === 'string') return <th title={header.title}>{header}</th>
  if (header.icon) return <th title={header.title}><Icon name={header.icon} /></th>
  return null
}

const Cell = ({ isEditing, col, row, onClick }) => {
  let style = {}
  let contents = {}

  if (isEditing) {
    style = {
      background: '#FFF9C4'
    }
  }

  if (col.field) {
    contents = row[col.field]
  }

  if (col.render) {
    contents = col.render(row)
  }

  return (
    <td
      onClick={onClick}
      style={style}>
      {contents}
    </td>
  )
}

class EditModal extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      value: props.value[props.field]
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleUpdateClick = this.handleUpdateClick.bind(this)
  }

  handleChange (e) {
    const value = (idx(e, _ => _.target.value) || idx(e, _ => _.hex) || e)
    this.setState({
      value
    })
  }

  handleUpdateClick () {
    const value = this.state.value

    if (typeof this.props.value[this.props.field] === 'number') {
      this.props.onUpdate(parseInt(value))
    } else {
      this.props.onUpdate(value)
    }
  }

  render () {
    const { style, value, field } = this.props

    const boxStyle = {
      zIndex: 50,
      position: 'absolute',
      width: 320,
      ...style
    }

    return (
      <div
        style={boxStyle}>
        {
          field === 'color'
          ? <SwatchesPicker
            color={this.state.value}
            onChange={this.handleChange}
            onChangeComplete={this.handleUpdateClick} />
          : <Paper
            style={{ padding: 6 }}
            elevation={10}>
            <TextField
              fullWidth
              name='modalEditText'
              autoFocus
              label={field.field}
              onChange={this.handleChange}
              value={this.state.value} />
            <Button
              fullWidth
              style={{ marginTop: 6 }}
              onClick={this.handleUpdateClick}>
              <span><Icon name='check' /></span>
            </Button>
          </Paper>
        }
      </div>
    )
  }
}

export class Table extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      editing: null
    }

    this.handleEditStart = this.handleEditStart.bind(this)
    this.handleEditEnd = this.handleEditEnd.bind(this)
    this.isEditing = this.isEditing.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
  }

  handleEditStart (e, rowIndex, colIndex) {
    const editingField = this.props.structure(this.props)[colIndex].field

    if (!editingField) {
      return
    }

    const bodyRect = document.body.getBoundingClientRect()
    const targetRect = e.currentTarget.getBoundingClientRect()

    this.setState({
      editing: [rowIndex, colIndex],
      editingValue: this.props.rows[rowIndex],
      editingField,
      editModalPosition: {
        top: targetRect.bottom - bodyRect.top,
        left: targetRect.left - bodyRect.left,
        minWidth: targetRect.width
      }
    })
  }

  handleEditEnd () {
    this.setState({
      editing: null
    })
  }

  handleUpdate (newValue) {
    const _id = this.props.rows[this.state.editing[0]]._id
    const update = {
      $set: {
        [this.state.editingField]: newValue
      }
    }

    this.props.onUpdate(_id, update)
    this.handleEditEnd()
  }

  isEditing (rowIndex, colIndex) {
    return !!(this.state.editing && isEqual(this.state.editing, [rowIndex, colIndex]))
  }

  render () {
    const { structure, rows } = this.props
    const cols = structure(this.props)

    return (
      <div style={{ overflowX: 'scroll' }}>
        <table className='table'>
          <thead>
            <tr>{
              cols.map((col, i) =>
                <ColHeader key={i} header={col.header} />
              )
            }</tr>
          </thead>
          <tbody>{
            rows.map((row, i) =>
              <tr key={i}>{
                cols.map((col, j) =>
                  <Cell
                    key={j}
                    onClick={(e) => this.handleEditStart(e, i, j)}
                    isEditing={this.isEditing(i, j)}
                    col={col}
                    row={row} />
                )
              }</tr>
          )}</tbody>
        </table>
        <Portal
          closeOnEsc
          closeOnOutsideClick
          onClose={this.handleEditEnd}
          isOpened={!!this.state.editing}
        >
          <EditModal
            onUpdate={this.handleUpdate}
            style={this.state.editModalPosition}
            value={this.state.editingValue}
            field={this.state.editingField}
          />
        </Portal>
      </div>
    )
  }
}
