import React from 'react'

export const Table = ({ children, tableStyle, ...props }) =>
  <div {...props} className='table-responsive enable-select'>
    <table style={tableStyle} className='table no-margin'>
      {children}
    </table>
  </div>

export const TableBody = ({ children, ...props }) =>
  <tbody {...props}>{children}</tbody>

export const TableCell = ({ children, ...props }) =>
  <td {...props}>{children}</td>

export const TableHead = ({ children, ...props }) =>
  <thead {...props}>{children}</thead>

export const TableRow = ({ children, ...props }) =>
  <tr {...props}>{children}</tr>

export const numberCellStyle = {
  textAlign: 'right'
}

export const textCellStyle = {
  textAlign: 'left'
}

export const iconCellStyle = {
  textAlign: 'center'
}

export const separatorStyle = {
  borderLeft: '1px solid #ccc'
}

export const doubleSeparatorStyle = {
  borderLeft: '3px double #ccc'
}

export const headerTitleStyle = {
  ...separatorStyle,
  textAlign: 'center'
}

export const doubleSeparatorHeaderTitleStyle = {
  ...headerTitleStyle,
  ...doubleSeparatorStyle
}

export const summaryRowStyle = {
  borderTop: doubleSeparatorStyle.borderLeft
}
