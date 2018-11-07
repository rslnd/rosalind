import React from 'react'
import { Search } from './Search'
import { TagsList } from '../../tags/TagsList'

export const Help = ({
  searchValue,
  handleSearchValueChange,
  results,
  parsedQuery
}) =>
  <div style={containerStyle}>
    <Search value={searchValue} onChange={handleSearchValueChange} />
    <div style={resultsStyle}>
      {JSON.stringify(parsedQuery)}
      {JSON.stringify(results)}
      {
        results.map(result =>
          <Result key={result.key} result={result} />
        )
      }
    </div>
  </div>

const Result = ({ result }) =>
  <div>
    <h4>{result.fullNameWithTitle}</h4>
    {JSON.stringify(result.availabilities)}
  </div>

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '100%'
}

const resultsStyle = {
  flex: 1,
  overflowY: 'scroll'
}
