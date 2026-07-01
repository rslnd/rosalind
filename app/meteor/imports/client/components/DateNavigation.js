import React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment-timezone'
import { withRouter } from 'react-router-dom'
import { withTracker } from '../components/withTracker'
import Button from 'react-bootstrap/lib/Button'
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup'
import { DayPickerSingleDateController } from 'react-dates'
import { PortalWithState } from 'react-portal'
import { __ } from '../../i18n'
import { Schedules } from '../../api/schedules'
import { dayToDate } from '../../util/time/day'
import { Icon } from './Icon'
import { skipForwards, skipBackwards } from '../../api/messages/methods/skipBackwards'

const calendarPadding = 6
const calendarPaddingTop = 2
export const calendarStyle = {
  position: 'fixed',
  zIndex: 50,
  top: 50 - calendarPaddingTop,
  right: 15 - calendarPadding,
  display: 'none'
}

export const calendarStyleOpen = {
  ...calendarStyle,
  display: 'block'
}

const composer = props => {
  const holidays = Schedules.find({
    type: 'holiday'
  }).fetch().map(h => moment(dayToDate(h.day)).format('YYYY-MM-DD')).sort()

  const isHoliday = m =>
    m.isoWeekday() === 7 ||
    holidays.includes(m.format('YYYY-MM-DD'))

  return {
    ...props,
    isHoliday
  }
}

// Build the selectable month list: from January 2021 up to two years into the
// future, so the dropdown can scroll back to 2021 and forward two years.
const buildMonthOptions = () => {
  const options = []
  const cursor = moment('2021-01-01').startOf('month')
  const last = moment().add(2, 'years').startOf('month')
  while (cursor.isSameOrBefore(last, 'month')) {
    options.push(cursor.clone())
    cursor.add(1, 'month')
  }
  return options
}

const monthCaptionRootStyle = {
  position: 'relative',
  textAlign: 'center',
  // Lift the caption so it lines up with the nav arrows: they sit at top: 18px,
  marginTop: -4
}

const monthCaptionStyle = {
  boxSizing: 'border-box',
  height: 33,
  padding: '0 9px',
  border: '1px solid #e4e7e7',
  borderRadius: 3,
  background: '#fff',
  font: 'inherit',
  fontWeight: 'bold',
  color: '#484848',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center'
}

// ancestor).
const monthListStyle = {
  position: 'absolute',
  zIndex: 100,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 170,
  maxHeight: 240,
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  fontSize: 12,
  background: '#fff',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: 3,
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
}

const monthItemStyle = {
  padding: '6px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  textAlign: 'left'
}

class MonthYearSelect extends React.Component {
  constructor (props) {
    super(props)

    this.state = { open: false, hovered: null, coords: null, captionHover: false, captionPressed: false }
    this.toggle = this.toggle.bind(this)
    this.close = this.close.bind(this)
    this.handleOutsideClick = this.handleOutsideClick.bind(this)
    this.setListRef = this.setListRef.bind(this)
    this.setCurrentRef = this.setCurrentRef.bind(this)
    this.rootRef = React.createRef()
    this.buttonRef = React.createRef()
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleOutsideClick, true)
  }

  toggle (e) {
    if (e) e.preventDefault()
    if (this.state.open) {
      this.close()
      return
    }
    const container = this.props.getContainer && this.props.getContainer()
    const buttonRect = this.buttonRef.current.getBoundingClientRect()
    const containerRect = container ? container.getBoundingClientRect() : { top: 0 }
    const coords = {
      top: buttonRect.bottom - containerRect.top + 2
    }
    this.setState({ open: true, coords }, () => {
      document.addEventListener('mousedown', this.handleOutsideClick, true)
      // Scroll the currently shown month to the top so the next months follow.
      if (this.listEl && this.currentEl) {
        this.listEl.scrollTop = this.currentEl.offsetTop
      }
    })
  }

  close () {
    document.removeEventListener('mousedown', this.handleOutsideClick, true)
    this.setState({ open: false })
  }

  handleOutsideClick (e) {
    const inButton = this.rootRef.current && this.rootRef.current.contains(e.target)
    const inList = this.listEl && this.listEl.contains(e.target)
    if (!inButton && !inList) {
      this.close()
    }
  }

  setListRef (el) {
    this.listEl = el
  }

  setCurrentRef (el) {
    this.currentEl = el
  }

  render () {
    const { month, months, onSelect, getContainer } = this.props
    const { open, hovered, coords, captionHover, captionPressed } = this.state
    const today = moment()
    const container = getContainer && getContainer()
    let captionLook = { borderColor: '#e4e7e7', background: '#fff' }
    if (captionPressed) {
      captionLook = { borderColor: '#c4c4c4', background: '#f2f2f2' }
    } else if (captionHover || open) {
      captionLook = { borderColor: '#c4c4c4', background: '#fff' }
    }

    return (
      <div ref={this.rootRef} style={monthCaptionRootStyle}>
        <button
          type='button'
          ref={this.buttonRef}
          onClick={this.toggle}
          onMouseEnter={() => this.setState({ captionHover: true })}
          onMouseLeave={() => this.setState({ captionHover: false, captionPressed: false })}
          onMouseDown={() => this.setState({ captionPressed: true })}
          onMouseUp={() => this.setState({ captionPressed: false })}
          style={{ ...monthCaptionStyle, ...captionLook }}>
          {month.format('MMMM YYYY')}
          &nbsp;
          <Icon name='caret-down' />
        </button>
        {
          open && container && coords &&
            ReactDOM.createPortal(
              <div
                ref={this.setListRef}
                style={{ ...monthListStyle, top: coords.top }}>
                {
                  months.map((m, i) => {
                    // The currently shown month is highlighted (and scrolled to).
                    const isShown = m.isSame(month, 'month')
                    const isPast = m.isBefore(today, 'month')
                    // Thin line before every January (except the very first entry).
                    const startsNewYear = m.month() === 0 && i !== 0
                    return (
                      <div
                        key={m.format('YYYY-MM')}
                        ref={isShown ? this.setCurrentRef : null}
                        onMouseEnter={() => this.setState({ hovered: i })}
                        onMouseLeave={() => this.setState({ hovered: null })}
                        onClick={() => { onSelect(m); this.close() }}
                        style={{
                          ...monthItemStyle,
                          color: isPast ? '#aaa' : 'inherit',
                          fontWeight: isShown ? 'bold' : 'normal',
                          borderTop: startsNewYear ? '1px solid #e0e0e0' : 'none',
                          background: hovered === i
                            ? '#f0f0f0'
                            : (isShown ? '#e6f3f1' : 'transparent')
                        }}>
                        {m.format('MMMM YYYY')}
                      </div>
                    )
                  })
                }
              </div>,
              container
            )
        }
      </div>
    )
  }
}

class DateNavigationButtons extends React.Component {
  constructor (props) {
    super(props)

    this.monthOptions = buildMonthOptions()
    this.calendarRef = React.createRef()
    this.getCalendarContainer = () => this.calendarRef.current

    this.renderMonthElement = this.renderMonthElement.bind(this)
    this.handleMonthPick = this.handleMonthPick.bind(this)
    this.goToDate = this.goToDate.bind(this)
    this.dateToPath = this.dateToPath.bind(this)
    this.handleBackwardMonthClick = this.handleBackwardMonthClick.bind(this)
    this.handleBackwardWeekClick = this.handleBackwardWeekClick.bind(this)
    this.handleBackwardDayClick = this.handleBackwardDayClick.bind(this)
    this.handleTodayClick = this.handleTodayClick.bind(this)
    this.handleForwardDayClick = this.handleForwardDayClick.bind(this)
    this.handleForwardWeekClick = this.handleForwardWeekClick.bind(this)
    this.handleForwardMonthClick = this.handleForwardMonthClick.bind(this)
    this.handleCalendarDayChange = this.handleCalendarDayChange.bind(this)
    this.isToday = this.isToday.bind(this)
    this.isSelected = this.isSelected.bind(this)
    this.initialVisibleMonth = this.initialVisibleMonth.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  componentDidMount () {
    document.addEventListener('keydown', this.handleKeyDown, true)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleKeyDown, true)
    clearTimeout(this.closeTimer)
  }

  handleKeyDown (e) {
    // Escape should always blur the current input
    if (e.key === 'Escape') {
      if (this.props.onBlurSearch) {
        this.props.onBlurSearch()
      }
      return
    }

    // Don't navigate if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        if (e.shiftKey) {
          this.handleBackwardWeekClick()
        } else {
          this.handleBackwardDayClick()
        }
        break
      case 'ArrowRight':
        e.preventDefault()
        if (e.shiftKey) {
          this.handleForwardWeekClick()
        } else {
          this.handleForwardDayClick()
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (e.shiftKey) {
          this.handleBackwardMonthClick()
        } else {
          this.handleBackwardWeekClick()
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (e.shiftKey) {
          this.handleForwardMonthClick()
        } else {
          this.handleForwardWeekClick()
        }
        break
      case 'h':
      case 'H':
        e.preventDefault()
        this.handleTodayClick()
        break
      case '?':
        e.preventDefault()
        if (this.props.onKeyboardShortcutsToggle) {
          this.props.onKeyboardShortcutsToggle()
        }
        break
      case ' ':
        e.preventDefault()
        if (this.props.onFocusSearch) {
          this.props.onFocusSearch()
        }
        break
    }
  }

  dateToPath (date) {
    return `/${this.props.basePath}/${date.format('YYYY-MM-DD')}`
  }

  goToDate (date, nextOrPrevious = 'next') {
    const skip = m =>
      m.isoWeekday() === 7 ||
      this.props.isHoliday(m)

    let targetDay = date
    if (skip(targetDay)) {
      if (nextOrPrevious === 'next') {
        targetDay = skipForwards({ start: date, skip })
      } else {
        targetDay = skipBackwards({ start: date, skip })
      }
    }

    const path = this.dateToPath(targetDay)
    this.props.history.replace(path)
  }

  handleBackwardMonthClick () {
    this.goToDate(moment(this.props.date).subtract(1, 'month'), 'previous')
  }

  handleBackwardWeekClick () {
    this.goToDate(moment(this.props.date).subtract(1, 'week'), 'previous')
  }

  handleBackwardDayClick () {
    this.goToDate(moment(this.props.date).subtract(1, 'day'), 'previous')
  }

  handleTodayClick () {
    const path = this.dateToPath(moment())
    this.props.history.push(path)
    this.goToPickerMonth(moment())

    this.props.onTodayClick && this.props.onTodayClick()
  }

  goToPickerMonth (target) {
    const m = this.captionMonth
    if (!this.calendarRef.current || !this.captionOnMonthSelect || !m) {
      return
    }
    const monthDiff = (target.year() - m.year()) * 12 + (target.month() - m.month())
    this.captionOnMonthSelect(m, m.month() + monthDiff)
  }

  handleMonthPick (target) {
    this.goToPickerMonth(target)
    this.handleCalendarDayChange(this.pickDayInMonth(target))
  }

  handleForwardDayClick () {
    this.goToDate(moment(this.props.date).add(1, 'day'))
  }

  handleForwardWeekClick () {
    this.goToDate(moment(this.props.date).add(1, 'week'))
  }

  handleForwardMonthClick () {
    this.goToDate(moment(this.props.date).add(1, 'month'))
  }

  handleCalendarDayChange (date) {
    const path = this.dateToPath(moment(date))
    this.props.history.replace(path)
  }

  isToday (day) {
    return day.isSame(moment(), 'day')
  }

  isSelected (day) {
    return day.isSame(this.props.date, 'day')
  }

  initialVisibleMonth () {
    return moment(this.props.date)
  }

  // Day to jump to within a month chosen from the dropdown: the same day of the
  // month as the current date, but never on a blocked (greyed-out) day where the
  // practice is closed. If that day is blocked, move to the nearest open day
  // still within that month; if the whole month is blocked, fall back to the
  // nearest day even though it is greyed out.
  pickDayInMonth (monthMoment) {
    const isBlocked = this.props.isHoliday
    const daysInMonth = monthMoment.daysInMonth()
    const desiredDay = Math.min(moment(this.props.date).date(), daysInMonth)
    const base = monthMoment.clone().date(desiredDay)

    if (!isBlocked(base)) {
      return base
    }

    for (let d = 1; d < daysInMonth; d += 1) {
      const forward = base.clone().add(d, 'days')
      if (forward.isSame(monthMoment, 'month') && !isBlocked(forward)) {
        return forward
      }
      const backward = base.clone().subtract(d, 'days')
      if (backward.isSame(monthMoment, 'month') && !isBlocked(backward)) {
        return backward
      }
    }

    return base
  }

  renderMonthElement ({ month, onMonthSelect, isVisible }) {
    if (!isVisible) {
      return <strong>{month.format('MMMM YYYY')}</strong>
    }
    // Capture so navigation triggered outside the caption (the "today" button)
    // can move the visible month through the same path.
    this.captionMonth = month
    this.captionOnMonthSelect = onMonthSelect
    return (
      <MonthYearSelect
        month={month}
        months={this.monthOptions}
        onSelect={this.handleMonthPick}
        getContainer={this.getCalendarContainer}
      />
    )
  }

  render () {
    return (
      <div className={`breadcrumbs page-actions hide-print ${this.props.pullRight && 'pull-right'}`}>
        <PortalWithState
          closeOnEsc>
          {
            ({ openPortal, closePortal, isOpen, portal }) => {
              const handleOpen = e => {
                clearTimeout(this.closeTimer)
                openPortal(e)
              }
              const handleClose = () => {
                clearTimeout(this.closeTimer)
                this.closeTimer = setTimeout(closePortal, 80)
              }
              return (
                <div>
                  <ButtonGroup onMouseOver={handleOpen}>
                  {this.props.before}

                  {
                    this.props.jumpMonthBackward &&
                      <Button
                        onClick={this.handleBackwardMonthClick}
                        title={__('time.oneMonthBackward')}>
                        <Icon name='angle-left' />
                        <Icon name='angle-left' />
                      </Button>
                  }
                  {
                    this.props.jumpWeekBackward &&
                      <Button
                        onClick={this.handleBackwardWeekClick}
                        title={__('time.oneWeekBackward')}>
                        <Icon name='angle-double-left' />
                      </Button>
                  }

                  <Button
                    onClick={this.handleBackwardDayClick}
                    title={__('time.oneDayBackward')}>
                    <Icon name='caret-left' />
                  </Button>

                  <Button
                    onClick={this.handleTodayClick}>
                    {__('ui.today')}
                  </Button>

                  <Button
                    onClick={this.handleForwardDayClick}
                    title={__('time.oneDayForward')}>
                    <Icon name='caret-right' />
                  </Button>

                  {
                    this.props.jumpWeekForward &&
                      <Button
                        onClick={this.handleForwardWeekClick}
                        title={__('time.oneWeekForward')}>
                        <Icon name='angle-double-right' />
                      </Button>
                  }
                  {
                    this.props.jumpMonthForward &&
                      <Button
                        onClick={this.handleForwardMonthClick}
                        title={__('time.oneMonthForward')}>
                        <Icon name='angle-right' />
                        <Icon name='angle-right' />
                      </Button>
                  }

                </ButtonGroup>
                &nbsp;
                <ButtonGroup>
                  {
                    portal(
                      <div
                        className='hide-print'
                        style={isOpen ? calendarStyleOpen : calendarStyle}>
                        <div
                          ref={this.calendarRef}
                          onMouseOver={handleOpen}
                          onMouseLeave={handleClose}
                          style={{ position: 'relative', padding: `${calendarPaddingTop}px ${calendarPadding}px ${calendarPadding}px` }}>
                          <DayPickerSingleDateController
                            onDateChange={this.handleCalendarDayChange}
                            date={this.props.date}
                            isDayHighlighted={this.isToday}
                            isDayBlocked={this.props.isHoliday}
                            focused
                            initialVisibleMonth={this.initialVisibleMonth}
                            renderMonthElement={this.renderMonthElement}
                            enableOutsideDays
                            hideKeyboardShortcutsPanel
                            numberOfMonths={1}
                          />
                        </div>
                      </div>
                    )
                  }

                  {
                    this.props.children && <div onMouseEnter={isOpen ? closePortal : null}>
                      {this.props.children}
                    </div>
                  }
                </ButtonGroup>
              </div>
              )
            }
          }
        </PortalWithState>
      </div>
    )
  }
}

export const DateNavigation = withRouter(withTracker(composer)(DateNavigationButtons))
