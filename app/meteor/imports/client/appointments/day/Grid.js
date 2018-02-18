import React from 'react'
import PropTypes from 'prop-types'
import { Grid as VirtualizedGrid, AutoSizer } from 'react-virtualized'
import 'react-virtualized/styles.css'

export class Grid extends React.Component {
  render () {
    const { columns, rows } = this.props
    return (
      <div style={{ backgroundColor: 'red', height: '100%' }}>
        <AutoSizer>
          {({ height, width }) =>
            <VirtualizedGrid
              cellRenderer={cellRenderer}
              columnCount={columns.length}
              columnWidth={width / (columns.length || 1)}
              height={height}
              rowCount={rows.length}
              rowHeight={30}
              width={width}
            />
          }
        </AutoSizer>
      </div>
    )
  }
}

Grid.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired
}

const cellRenderer = ({ columnIndex, key, rowIndex, style }) =>
  <div
    key={key}
    style={style}>
    {columnIndex}-{rowIndex}
  </div>
