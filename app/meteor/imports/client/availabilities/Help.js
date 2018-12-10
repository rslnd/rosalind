import moment from 'moment-timezone'
import React from 'react'
import Avatar from '@material-ui/core/Avatar'
import Chip from '@material-ui/core/Chip'
import { Search } from './Search'
import { TagsList } from '../tags/TagsList'
import { rowStyle } from '../components/form'
import { __ } from '../../i18n'
import { grayDisabled } from '../layout/styles'

export const Help = ({
  searchValue,
  handleSearchValueChange,
  results,
  parsedQuery
}) =>
  <div style={containerStyle}>
    <Search value={searchValue} onChange={handleSearchValueChange} />
    {/* {JSON.stringify(parsedQuery)} */}
    {
      (parsedQuery.failed || results.length === 0)
      ? <span>No results</span>
      : (parsedQuery.wanted === 'assignee')
      ? <div style={resultsStyle}>
        {
          results.map(result =>
            <Assignee
              key={result.key}
              assignee={result.assignee}
              availabilities={result.availabilities}
            />
          )
        }
      </div>
      : (parsedQuery.wanted === 'tag')
      ? <div style={resultsStyle}>
        {
          results.map(result =>
            <Tag key={result.key} tag={result.tag} assignees={result.assignees} />
          )
        }
      </div>
      : null // This should not happen
    }
  </div>

const Tag = ({ tag, assignees }) =>
  <div>
    <h3><TagsList tags={[tag]} /></h3>
    {
      assignees.map(a =>
        <Assignee key={a.key} assignee={a.assignee} availabilities={a.availabilities} />
      )
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
        <div key={availability._id} style={availabilitiesStyle}>
          <Dates>
            {
              availability.collapsedAvailabilities
              ? availability.collapsedAvailabilities.map(a =>
                <DateIndicator key={a._id} availability={a} />
              )
              : <DateIndicator availability={availability} />
            }
          </Dates>
          <div style={tagsListStyle}>
            <TagsList
              tiny
              tags={availability.matchedTags}
              groupTags={false}
            />
          </div>
        </div>
      )
    }
  </div>

const tagsListStyle = {
  flex: 1
}

const availabilitiesStyle = {
  ...rowStyle,
  borderBottom: `1px solid ${grayDisabled}`,
  paddingBottom: 10,
  marginBottom: 10
}

const Dates = ({ children }) =>
  <div style={datesStyle}>{children}</div>

const datesStyle = {
  width: 110
}

const DateIndicator = ({ availability }) =>
  <div style={dateIndicatorStyle}>
    {formatDate(availability)}
  </div>

const dateIndicatorStyle = {
  paddingBottom: 3
}

const formatDate = ({ from, to }) => {
  const m = moment.tz(from, 'Europe/Vienna')
  return <span style={dateContainerStyle}>
    <b
      style={weekdayStyle}
      title={m.format('dddd')}
    >{m.format('dd')}.&nbsp;</b>
    <span style={dateStyle}>
      {m.format('D. MMM')}
      &nbsp;&nbsp;
      {AmPmRange({ from, to })}
    </span>
  </span>
}

const dateContainerStyle = {
  display: 'flex',
  width: 33 + 90
}

const weekdayStyle = {
  display: 'inline-block',
  width: 28
}

const dateStyle = {
  display: 'inline-block',
  flexGrow: 1
}

const AmPmRange = ({ from, to }) => {
  const a = amPm(from)
  return a !== amPm(to)
    ? null
    : <span className='text-muted' title={__(`time.${a}Long`)}>
      {__(`time.${a}`)}
    </span>
}

const amPm = d =>
  parseInt(moment.tz(d, 'Europe/Vienna').format('HH')) >= 13
  ? 'pm'
  : 'am'

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '100%'
}

const resultsStyle = {
  flex: 1,
  overflowY: 'scroll'
}
