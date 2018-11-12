import moment from 'moment-timezone'
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
    {
      parsedQuery.failed || results.length === 0
      ? <span>No results</span>
      : parsedQuery.wanted === 'assignee'
      ? <div style={resultsStyle}>
        {
          results.map(result =>
            <Assignee key={result.key} assignee={result.assignee} availabilities={result.availabilities} />
          )
        }
      </div>
      : parsedQuery.wanted === 'tag'
      ? <span>Tag search not implemented</span>
      : null // This should not happen
    }
  </div>

const Assignee = ({ assignee, availabilities }) =>
  <div>
    <h4>{assignee.fullNameWithTitle}</h4>
    <Availabilities availabilities={availabilities} showTags />
  </div>

const Availabilities = ({ availabilities, showTags }) =>
  <div>
    {
      availabilities.map(availability =>
        <div key={availability._id}>
          <h5>{formatDate(availability)}</h5>
          <TagsList tiny tags={availability.tags} />
        </div>
      )
    }
  </div>

const formatDate = ({ from, to }) =>
  [
    moment.tz(from, 'Europe/Vienna').format('dd., D.M'),
    amPmRange({ from, to })
  ].join(' ')

const amPmRange = ({ from, to }) => {
  const a = amPm(from)
  return a === amPm(to) ? a : ''
}

const amPm = d =>
  parseInt(moment.tz(d, 'Europe/Vienna').format('HH')) >= 13
  ? 'Nm'
  : 'Vm'

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '100%'
}

const resultsStyle = {
  flex: 1,
  overflowY: 'scroll'
}
