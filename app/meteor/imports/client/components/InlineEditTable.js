import idx from 'idx'
import React from 'react'
import { PortalWithState } from 'react-portal'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import isEqual from 'lodash/isEqual'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import SwatchesPicker from 'react-color/lib/Swatches'
import { Icon } from './Icon'
import { __ } from '../../i18n'

const ColHeader = ({ style, icon, header, description }) => {
  return <th style={style} title={description}>
    { icon && <Icon name={icon} /> }
    { header || '' }
  </th>
}

const Cell = ({ isEditing, col, row, onClick, rows }) => {
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
    contents = col.render(row, rows)
  }

  if (!col.render && col.type === Boolean) {
    contents = row[col.field] ? <Icon name='check' /> : null
  }

  if (!col.render && col.type === 'file') {
    try {
    contents = row[col.field]
      ? <span>
          <Icon name='document' />&nbsp;
          {parseInt(row[col.field].length / 1024 ) + ' kB'}
        </span>
      : null
    } catch (e) {
      console.error(e)
      contents = <Icon name='document' />
    }
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

    const initialValue = props.value[props.structure.field]

    this.state = {
      value: props.structure.stringify
        ? props.structure.stringify(initialValue)
        : initialValue
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleUpdateClick = this.handleUpdateClick.bind(this)
  }

  handleChange (e) {
    if (this.props.structure.type === 'file') {
      const file = e.target.files[0]
      console.log(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        this.setState({
          value: reader.result
        })
      }
      reader.readAsDataURL(file)

      return
    }

    // const value = (idx(e, _ => _.target.value) || idx(e, _ => _.hex) || e)
    const value = (e && e.target) ? e.target.value : (
      (e && e.hex) ? e.hex : (
        e
      )
    )

    console.log('setting state to', value)
    this.setState({
      value
    })
  }

  handleUpdateClick () {
    const value = typeof this.props.value[this.props.structure.field] === 'number'
      ? parseInt(this.state.value)
      : this.state.value

    if (this.props.structure.fromString) {
      this.props.onUpdate(this.props.structure.fromString(value))
    } else {
      this.props.onUpdate(value)
    }
  }

  render () {
    const { style, structure: { accept, type, field, isMulti, EditComponent } } = this.props

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
          EditComponent
            ? <Paper style={{ padding: 6 }}>
              <EditComponent
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
          : field === 'color'
          ? <SwatchesPicker
            color={this.state.value}
            onChange={this.handleChange}
            onChangeComplete={this.handleUpdateClick} />
          : type === 'file'
          ? <Paper
            style={{ padding: 6 }}
            elevation={10}>
              <input
                type='file'
                accept={accept}
                onChange={this.handleChange} />
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
              value={this.state.value || ''} />
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
      editing: null,
      inserting: null
    }

    this.handleEditStart = this.handleEditStart.bind(this)
    this.handleEditEnd = this.handleEditEnd.bind(this)
    this.isEditing = this.isEditing.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.handleInsertClick = this.handleInsertClick.bind(this)
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
        const row = this.props.rows[rowIndex] || this.state.inserting
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
        editingValue: this.props.rows[rowIndex] || '',
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
    const row = this.props.rows[this.state.editing[0]]
    const _id = row ? row._id : undefined
    const field = this.state.editingStructure.field

    if (!_id) {
      this.props.onInsert({
        ...this.state.inserting,
        [field]: newValue
      })

      this.setState({
        inserting: null
      })

      this.handleEditEnd()
      return
    }

    // Cannot set an array field to null, need to unset to remove
    const update = (this.state.editingStructure.unsetWhenEmpty && (!newValue || newValue.length === 0))
      ? ({
        $unset: {
          [field]: 1
        }
      }) : ({
        $set: {
          [field]: newValue
        }
      })

    console.log('[InlineEditTable] Update', _id, update)

    this.props.onUpdate(_id, update)
    this.handleEditEnd()
  }

  isEditing (rowIndex, colIndex) {
    return !!(this.state.editing && isEqual(this.state.editing, [rowIndex, colIndex]))
  }

  handleInsertClick () {
    this.setState({
      inserting: this.props.defaultValues()
    })
  }

  render () {
    const { structure, rows, onInsert, onRemove } = this.props
    const { inserting } = this.state
    const cols = structure(this.props)

    const actualRows = inserting
      ? [...rows, inserting]
      : rows

    return (
      <PortalWithState
        closeOnEsc
        // closeOnOutsideClick
        onClose={this.handleEditEnd}
      >{
          ({ portal, openPortal, closePortal, isOpen }) =>
            <div>
              <div style={{ overflowX: 'auto' }}>
                <table className='table'>
                  <thead>
                    <tr>
                      {
                        cols.map((col, i) =>
                          <ColHeader key={i} {...col} />
                        )
                      }
                      {
                        onRemove && <td />
                      }
                    </tr>
                  </thead>
                  <tbody>{
                    actualRows.map((row, i) =>
                      <tr key={i}>
                        {
                          cols.map((col, j) =>
                            <Cell
                              key={j}
                              onClick={this.handleEditStart(i, j, openPortal)}
                              isEditing={this.isEditing(i, j)}
                              col={col}
                              row={row}
                              rows={rows} />
                          )
                        }
                        {
                          row._id && onRemove &&
                          <td>
                            <Button
                              onClick={() => onRemove(row._id)}
                            >
                              <Icon name='minus' />
                            </Button>
                          </td>
                        }
                      </tr>
                    )}</tbody>
                </table>
              </div>

              {
                onInsert && !inserting &&
                <div>
                  <Button
                    fullWidth
                    style={{ marginTop: 6 }}
                    onClick={this.handleInsertClick}>
                    {
                      this.state.inserting
                        ? <span><Icon name='check' /> {__('ui.save')}</span>
                        : <span><Icon name='plus' /> {__('ui.insert')}</span>
                    }
                  </Button>
                </div>
              }

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
