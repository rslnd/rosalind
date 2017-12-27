import React from 'react'
import { Icon } from './Icon'

const ColHeader = ({ header }) => {
  if (typeof header === 'string') return <th title={header.title}>{header}</th>
  if (header.icon) return <th title={header.title}><Icon name={header.icon} /></th>
  return null
}

export const Table = (props) => {
  const { structure, data } = props
  const cols = structure(props)

  return (
    <table className='table'>
      <thead>
        <tr>{
          cols.map((col, i) =>
            <ColHeader key={i} header={col.header} />
          )
        }</tr>
      </thead>
      <tbody>{
        data.map((row, i) =>
          <tr key={i}>{
            cols.map((col, j) =>
              <td key={j}>{col.render(row)}</td>
            )
          }</tr>
      )}</tbody>
    </table>
  )
}
