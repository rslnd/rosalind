import moment from 'moment-timezone'
import React from 'react'
import { withHandlers } from 'recompose'
import Tooltip from '@material-ui/core/Tooltip'
import { Search } from './Search'
import { TagsList } from '../tags/TagsList'
import { rowStyle } from '../components/form'
import { __ } from '../../i18n'
import { grayDisabled, highlightBackground, grayActive } from '../layout/styles'
import { TagDetails } from './TagDetails'
import { Icon } from '../components/Icon'

export const Help = ({
  isOpen,
  searchValue,
  handleSearchValueChange,
  results,
  parsedQuery,
  hoverTag,
  setHoverTag,
  hoverAvailability,
  setHoverAvailability,
  handleAvailabilityClick,
  searchRef
}) =>
  <div style={containerStyle}>
    <Search
      value={searchValue}
      onChange={handleSearchValueChange}
      searchRef={searchRef}
    />
    {/* {JSON.stringify(parsedQuery)} */}
    {
      (parsedQuery.failed || results.length === 0)
      ? <span /> // No results
      : (parsedQuery.wanted === 'assignee')
      ? <Results hoverTag={hoverTag} hoverAvailability={hoverAvailability}>
        {
          results.map(result =>
            <Assignee
              key={result.key}
              assignee={result.assignee}
              availabilities={result.availabilities}
              setHoverTag={setHoverTag}
              setHoverAvailability={setHoverAvailability}
              handleAvailabilityClick={handleAvailabilityClick}
            />
          )
        }
      </Results>
      : (parsedQuery.wanted === 'tag')
      ? <Results hoverTag={hoverTag} hoverAvailability={hoverAvailability}>
        {
          results.map(result =>
            <div key={result.key}>
              <h3><TagsList tags={[result.tag]} /></h3>
              {
                result.assignees.map(a =>
                  <Assignee
                    key={a.key}
                    assignee={a.assignee}
                    availabilities={a.availabilities}
                    setHoverTag={setHoverTag}
                    setHoverAvailability={setHoverAvailability}
                    handleAvailabilityClick={handleAvailabilityClick}
                  />
                )
              }
            </div>
          )
        }
      </Results>
      : null // This should not happen
    }
  </div>

const Assignee = ({
  assignee,
  availabilities,
  setHoverTag,
  setHoverAvailability,
  handleAvailabilityClick
}) =>
  <div>
    <h4>{assignee.fullNameWithTitle}</h4>
    <Availabilities
      availabilities={availabilities}
      showTags
      setHoverTag={setHoverTag}
      setHoverAvailability={setHoverAvailability}
      handleAvailabilityClick={handleAvailabilityClick}
    />
  </div>

const Availabilities = withHandlers({
  handleTagHover: props => availability => tag => {
    props.setHoverTag(tag)
    props.setHoverAvailability(availability._id)
  }
})(({
  availabilities,
  showTags,
  setHoverAvailability,
  handleAvailabilityClick,
  handleTagHover
}) =>
  <div>
    {
      availabilities.map(availability =>
        <div key={availability._id} style={availabilitiesStyle}>
          <Dates>
            {
              availability.collapsedAvailabilities
              ? availability.collapsedAvailabilities.map(a =>
                <DateIndicator
                  key={a._id}
                  onClick={handleAvailabilityClick}
                  onMouseEnter={setHoverAvailability}
                  availability={a} />
              )
              : <DateIndicator
                availability={availability}
                onClick={handleAvailabilityClick}
                onMouseEnter={setHoverAvailability}
              />
            }
          </Dates>
          <div style={tagsListStyle}>
            <TagsList
              tiny
              tags={availability.matchedTags}
              onMouseEnter={handleTagHover(availability)}
              groupTags={false}
            />
          </div>
        </div>
      )
    }
  </div>
)

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
  width: 140,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
}

const DateIndicator = withHandlers({
  handleMouseEnter: props => e => props.onMouseEnter(props.availability._id),
  handleClick: props => e => props.onClick(props.availability._id)
})(({ availability, handleClick, handleMouseEnter }) =>
  <div
    onClick={handleClick}
    onMouseEnter={handleMouseEnter}
    style={availability.isHovering ? hoveringDateInidicatorStyle : dateIndicatorStyle}>
    <FormattedDate
      availability={availability}
      // prepend={
      //   <Tooltip title={availability.calendar.name}>
      //     <span style={iconStyle}><Icon name={availability.calendar.icon} />&nbsp;</span>
      //   </Tooltip>
      // }
    />
  </div>
)

const iconStyle = {
  color: grayActive
}

const dateIndicatorStyle = {
  paddingTop: 2,
  paddingRight: 0,
  paddingBottom: 2,
  paddingLeft: 0,
  cursor: 'pointer'
}

const hoveringDateInidicatorStyle = {
  ...dateIndicatorStyle,
  background: highlightBackground,
  textDecoration: 'underline'
}

const FormattedDate = ({ availability: {from, to}, prepend }) => {
  const m = moment.tz(from, 'Europe/Vienna')
  return <span style={dateContainerStyle}>
    {prepend}
    <b
      style={weekdayStyle}
      title={m.format('dddd')}
    >{m.format('dd')}.</b>
    <span style={dateStyle}>
      {m.format('D. MMM')}
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
      &nbsp;&nbsp;&nbsp;
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

const Results = (({ children, hoverTag, hoverAvailability }) =>
  <div style={resultsStyle}>
    <div style={resultsListStyle}>
      {children}
    </div>
    <div style={hoverDetailsStyle}>
      <HoverDetails
        hoverTag={hoverTag}
        hoverAvailability={hoverAvailability}
      />
    </div>
  </div>
)

const resultsStyle = {
  flex: 1,
  display: 'flex'
}

const resultsListStyle = {
  flex: 3,
  overflowY: 'scroll'
}

const hoverDetailsStyle = {
  flex: 2
}

const HoverDetails = ({ hoverTag, hoverAvailability }) =>
  <div>
    <TagDetails
      tag={hoverTag}
      availability={hoverAvailability}
    />
  </div>
