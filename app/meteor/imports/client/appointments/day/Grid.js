import React from 'react'
import PropTypes from 'prop-types'
import { Grid as VirtualizedGrid, AutoSizer } from 'react-virtualized'
import 'react-virtualized/styles.css'
import { TimeLegend } from './TimeLegend'

const containerStyle = {
  flex: 1,
  marginLeft: 10
}

const timeLegendWidth = 60

export class Grid extends React.Component {
  constructor (props) {
    super(props)

    this.renderCell = this.renderCell.bind(this)
    this.getColumnWidth = this.getColumnWidth.bind(this)
  }

  render () {
    const { columns, rows } = this.props

    return (
      <div style={containerStyle}>
        <AutoSizer>
          {({ height, width }) =>
            <VirtualizedGrid
              cellRenderer={this.renderCell}
              columnCount={columns.length}
              columnWidth={this.getColumnWidth(columns.length, width)}
              estimatedColumnWidth={(width - timeLegendWidth) / ((columns.length - 1) || 1)}
              height={height}
              rowCount={rows.length}
              rowHeight={25}
              width={width}
            />
          }
        </AutoSizer>
      </div>
    )
  }

  getColumnWidth (columnCount, width) {
    return ({ index }) =>
      index === 0
        ? timeLegendWidth
        : (width - timeLegendWidth) / ((columnCount - 1) || 1)
  }

  renderCell ({ columnIndex, key, rowIndex, style }) {
    let cell = '-'

    if (columnIndex === 0) {
      cell = <TimeLegend
        slotSize={this.props.slotSize}
        time={this.props.rows[rowIndex]}
      />
    } else {
      const appointment = this.props.getAppointment(columnIndex, rowIndex)

      if (appointment) {
        cell = appointment._id
      } else {
        cell = '---'
      }
    }

    return <div key={key} style={style}>{cell}</div>
  }
}

Grid.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  slotSize: PropTypes.number.isRequired,
  getAppointment: PropTypes.func.isRequired
}
