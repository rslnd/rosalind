import React from 'react'
import { lighterMutedBackground, mutedBackground } from '../layout/styles'
import { Info } from './Info'
import { Tags } from './Tags'
import { Note } from './Note'
import { ErrorBoundary } from '../layout/ErrorBoundary'
import { Calendars } from '../../api/calendars'
import { withProps, compose } from 'recompose'
import { Meteor } from 'meteor/meteor'
import { hasRole } from '../../util/meteor/hasRole'
import { CommentsContainer } from '../comments/CommentsContainer'
import { Drawer } from '../media/Drawer'
import { DropZone } from './DropZone'
import { insertMedia } from '../../startup/client/dataTransfer'
import { Documents } from './Documents'

export const AppointmentsList = ({ appointments, pastAppointmentsWithFloatingMedia, currentAppointment, currentCycle, handleMediaClick, fullNameWithTitle }) =>
  (pastAppointmentsWithFloatingMedia || appointments).map((a, i) =>
    <ErrorBoundary key={(a._id || (a.media && a.media[0] && a.media[0]._id) || i)}>
      {
        a.type === 'media'
          ? <Drawer
            media={a.media}
            style={drawerFullWidthStyle}
            handleMediaClick={handleMediaClick}
            currentCycle={currentCycle}
            currentAppointment={currentAppointment}
          />
          : <Appointment
            appointment={a}
            currentAppointment={currentAppointment}
            fullNameWithTitle={fullNameWithTitle}
            handleMediaClick={handleMediaClick}
            currentCycle={currentCycle}
          />
      }
    </ErrorBoundary>
  )

export const Appointment = compose(
  withProps(props => ({
    canSeeNote: hasRole(Meteor.userId(), ['appointments-note']),
    canSeeComments: hasRole(Meteor.userId(), ['appointments-comments']),
    collapseComments: hasRole(Meteor.userId(), ['appointments-commentsCollapse']),
    calendar: props.appointment ? Calendars.findOne({ _id: props.appointment.calendarId }) : null
  }))
)(({
  calendar,
  isCurrent,
  currentAppointment,
  appointment,
  fullNameWithTitle,
  canSeeNote,
  canSeeComments,
  collapseComments,
  currentCycle,
  handleMediaClick
}) =>
  <DropZone
    onDrop={f => insertMedia({ ...f, appointmentId: appointment._id, patientId: appointment.patientId })}
  >
    {({ ref, droppingStyle, isDropping }) =>
      <div ref={ref}
        style={
          isCurrent
            ? currentAppointmentStyle
            : (
              (appointment.removed || appointment.canceled)
                ? removedAppointmentStyle
                : appointmentStyle
            )
        }
      >
        <div style={isCurrent ? currentAppointmentInnerStyle : null}>
          <Info appointment={appointment} fullNameWithTitle={fullNameWithTitle} calendar={calendar} />
          <div style={tagsDocumentsRowStyle}>
            <div style={tagsStyle}><Tags {...appointment} isCurrent={isCurrent} /></div>
            {
              hasRole(Meteor.userId(), ['media', 'media-documents', 'media-view']) &&
                <div style={documentsStyle}>
                  <ErrorBoundary>
                    <Documents appointment={appointment} isCurrent={isCurrent} handleMediaClick={handleMediaClick} />
                  </ErrorBoundary>
                </div>
            }
          </div>


          {
            canSeeNote &&
              <Note {...appointment} isCurrent={isCurrent} />
          }

          {
            canSeeComments &&
              <CommentsContainer docId={appointment._id}
                collapsed={collapseComments}
              />
          }
        </div>

        {
          hasRole(Meteor.userId(), ['media', 'media-view', 'media-images']) &&
            <ErrorBoundary>
              <Drawer
                currentAppointment={currentAppointment}
                isCurrentAppointment={isCurrent}
                handleMediaClick={handleMediaClick}
                currentCycle={currentCycle}
                patientId={appointment.patientId}
                appointmentId={appointment._id}
                style={drawerAppointmentStyle}
              />
            </ErrorBoundary>
        }

        {isDropping && <div style={droppingStyle} />}
      </div>
    }
  </DropZone>
)

export const appointmentStyle = {
  borderRadius: 4,
  background: mutedBackground,
  marginLeft: 12,
  marginRight: 12,
  marginTop: 4,
  marginBottom: 4,
  position: 'relative'
}

const currentAppointmentStyle = {
  ...appointmentStyle,
  marginTop: 8,
  marginBottom: 12,
  background: '#fff'
}

export const currentAppointmentInnerStyle = {
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 5,
  paddingRight: 5
}

const removedAppointmentStyle = {
  ...appointmentStyle,
  background: lighterMutedBackground
}

const tagsDocumentsRowStyle = {
  display: 'flex'
}

const tagsStyle = {
  flex: 1
}

const documentsStyle = {
  flex: 1
}

const drawerAppointmentStyle = {
  borderRadius: `0 0 4px 4px`
}

const drawerFullWidthStyle = {
  marginTop: 7,
  marginBottom: 7,
  padding: 7
}
