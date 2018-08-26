import idx from 'idx'
import React from 'react'
import { PortalWithState } from 'react-portal'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import isEqual from 'lodash/isEqual'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { SwatchesPicker } from 'react-color'
import { Icon } from './Icon'
import { UserPicker } from '../users/UserPicker'

const ColHeader = ({ style, icon, header, description }) => {
  return <th style={style} title={description}>
    { icon && <Icon name={icon} /> }
    { header || '' }
  </th>
}

const Cell = ({ isEditing, col, row, onClick }) => {
  let style = col.style || {}
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
      value: props.value[props.structure.field]
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

    if (typeof this.props.value[this.props.structure.field] === 'number') {
      this.props.onUpdate(parseInt(value))
    } else {
      this.props.onUpdate(value)
    }
  }

  render () {
    const { style, value, structure: { field, isMulti, type } } = this.props

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
          : type === 'userId'
          ? <Paper style={{ padding: 6 }}>
            <UserPicker
              isMulti={isMulti}
              initialValue={this.state.value}
              onChange={this.handleChange}
            />
            <Button
              fullWidth
              style={{ marginTop: 6 }}
              onClick={this.handleUpdateClick}>
              <span><Icon name='check' /></span>
            </Button>
          </Paper>
          : <Paper
            style={{ padding: 6 }}
            elevation={10}>
            <TextField
              fullWidth
              name='modalEditText'
              autoFocus
              label={field.header}
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

  handleEditStart (rowIndex, colIndex, openPortal) {
    return e => {
      const structure = this.props.structure(this.props)[colIndex]
      const editingField = structure.field

      if (!editingField) {
        return
      }

      // Toggle on click
      if (structure.type === Boolean) {
        const row = this.props.rows[rowIndex]
        const update = {
          $set: {
            [editingField]: !row[editingField]
          }
        }
        return this.props.onUpdate(row._id, update)
      }

      openPortal()

      const bodyRect = document.body.getBoundingClientRect()
      const targetRect = e.currentTarget.getBoundingClientRect()

      this.setState({
        editing: [rowIndex, colIndex],
        editingValue: this.props.rows[rowIndex],
        editingStructure: structure,
        editModalPosition: {
          top: targetRect.bottom - bodyRect.top,
          left: targetRect.left - bodyRect.left,
          minWidth: targetRect.width
        }
      })
    }
  }

  handleEditEnd () {
    this.setState({
      editing: null
    })
  }

  handleUpdate (newValue) {
    const _id = this.props.rows[this.state.editing[0]]._id

    // Cannot set an array field to null, need to unset to remove
    const update = (this.state.editingStructure.unsetWhenEmpty && !newValue || newValue.length === 0)
      ? {
        $unset: {
          [this.state.editingStructure.field]: 1
        }
      } : {
        $set: {
          [this.state.editingStructure.field]: newValue
        }
      }

    console.log('[InlineEditTable] Update', update)

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
      <PortalWithState
        closeOnEsc
        // closeOnOutsideClick
        onClose={this.handleEditEnd}
      >{
        ({ portal, openPortal, closePortal, isOpen }) =>
          <div>
            <div style={{ overflowX: 'scroll' }}>
              <table className='table'>
                <thead>
                  <tr>{
                    cols.map((col, i) =>
                      <ColHeader key={i} {...col} />
                    )
                  }</tr>
                </thead>
                <tbody>{
                  rows.map((row, i) =>
                    <tr key={i}>{
                      cols.map((col, j) =>
                        <Cell
                          key={j}
                          onClick={this.handleEditStart(i, j, openPortal)}
                          isEditing={this.isEditing(i, j)}
                          col={col}
                          row={row} />
                      )
                    }</tr>
                )}</tbody>
              </table>
            </div>

            {
              portal(
                isOpen &&
                  <ClickAwayListener onClickAway={closePortal}>
                    <EditModal
                      onUpdate={(x, y) => { this.handleUpdate(x, y); closePortal() }}
                      style={this.state.editModalPosition}
                      value={this.state.editingValue}
                      structure={this.state.editingStructure}
                    />
                  </ClickAwayListener>
              )
            }
          </div>
        }
      </PortalWithState>
    )
  }
}
