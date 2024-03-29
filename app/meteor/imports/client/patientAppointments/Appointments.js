import React from 'react'
import { compose, withState, withHandlers, withPropsOnChange } from 'recompose'
import { Filter } from './Filter'
import { AppointmentsList, Appointment } from './Appointment'
import { Referrals } from './Referrals'
import { Oldest, Current, Future, separatorHeadingStyle } from './Sections'
import { Loading } from '../components/Loading'

export const Appointments = compose(
  withState('scrollRef', 'setScrollRef'),
  withHandlers({
    scrollToBottom: props => e => window.requestAnimationFrame(() => {
      if (props.scrollRef) {
        window.scr = props.scrollRef
        props.scrollRef.scrollTop = 1000000000 // FF doesn't like Number.MAX_SAFE_INTEGER
      }
    })
  }),
  withPropsOnChange(
    ['show', 'loading', 'appointmentsCount'],
    props => {
      if (props.page == 0) {
        props.scrollToBottom()
      }
    }
  )
)(({
  page,
  setPage,
  currentAppointment,
  pastAppointments,
  pastAppointmentsWithFloatingMedia,
  futureAppointments,
  fullNameWithTitle,
  setScrollRef,
  scrollToBottom,
  show,
  canRefer,
  loading,
  handleMediaClick,
  currentCycle,
  ...props
}) =>
  <div style={containerStyle}>
    <div style={floatingStyle}>
      <div style={shadowStyle}>
        <Filter {...props} fullNameWithTitle={fullNameWithTitle} />
      </div>
    </div>
    <div ref={setScrollRef} style={outerStyle}> {/* Scroll this to bottom */}
      <div style={middleStyle}>
        <div style={innerStyle}> {/* Inside this div things will not be reversed */}

          <div style={separatorHeadingStyle}>
              {pastAppointments.length > 0 &&
                <a href="#" onClick={() => setPage(page + 1)}>Vorherige Termine suchen</a>
              }
              
              <br />Seite {page + 1}<br/>

              {pastAppointments.length == 0 &&
              'Keine älteren Termine'}
          </div>

          <AppointmentsList
            pastAppointmentsWithFloatingMedia={pastAppointmentsWithFloatingMedia}
            fullNameWithTitle={fullNameWithTitle}
            currentAppointment={currentAppointment}
            currentCycle={currentCycle}
            show={show}
            handleMediaClick={handleMediaClick}
          />
          {
            loading && <Loading />
          }

          { page > 0 &&
            <div style={separatorHeadingStyle}>
              <a href="#" onClick={() => setPage(page - 1)}>Neuere Termine suchen</a>
            </div>
          }

          {
            currentAppointment && pastAppointments.length > 1 &&
            <Current />
          }
          {
            currentAppointment &&
            <Appointment
              key='current'
              appointment={currentAppointment}
              fullNameWithTitle={fullNameWithTitle}
              currentAppointment={currentAppointment}
              currentCycle={currentCycle}
              isCurrent
              handleMediaClick={handleMediaClick}
              show={show}
            />
          }
          {
            !loading && canRefer &&
            <Referrals appointment={currentAppointment} />
          }
          <Future
            futureAppointments={futureAppointments}
            fullNameWithTitle={fullNameWithTitle}
            scrollToBottom={scrollToBottom}
            show={show}
          />
        </div>
      </div>
    </div>
  </div>
)

const containerStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}

const floatingStyle = {
  position: 'absolute',
  width: '67%',
  top: 0,
  zIndex: 3,
  height: 28,
  pointerEvents: 'none'
}

const shadowStyle = {
  position: 'relative',
  width: '100%',
  height: 25,
  background: 'linear-gradient(hsla(220, 8%, 52%, 0.37) 0%, rgba(0, 0, 0, 0) 100%)',
  pointerEvents: 'none',
  borderRadius: '4px 0 0 0'
}

const outerStyle = {
  flex: 1,
  position: 'relative',
  maxHeight: '100%',
  overflow: 'auto',
  overscrollBehavior: 'contain'
}

const middleStyle = {
  display: 'flex',
  flexDirection: 'column-reverse'
}

const innerStyle = {
  paddingTop: 50
}
