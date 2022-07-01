import moment from 'moment-timezone'

export const getScheduleableTags = ({ time, assigneeId, calendarId }) => {
  const { Calendars } = require('../../calendars')
  const { Users } = require('../../users')
  const { Tags } = require('../../tags')

  const calendar = Calendars.findOne({ _id: calendarId })

  if (!(calendar && calendar.scheduleableTagsScript)) {
    return
  }

  try {
    const u = Users.find({}).fetch().reduce((acc, u) => { return {...acc, [u.username]: u._id} }, {})
    const t = Tags.find({}).fetch().reduce((acc, t) => { return {...acc, [t.tag]: t} }, {})
    const tid = Tags.find({}).fetch().reduce((acc, t) => { return {...acc, [t._id]: t} }, {})
    const log = (...a) => console.log('getScheduleableTagsScipt:', ...a)
    const without = (tags, ...withoutTagIds) => tags.filter(t => !withoutTagIds.includes(t._id))
    const isAM = (t) => t.hour() < 12
    const isPM = (t) => t.hour() >= 12
    const only = (pred, ...tags) => { if (pred) { return tags } else { return [] } }
    
    const fn = eval('(' + calendar.scheduleableTagsScript + ')')
    const tags = fn(assigneeId, moment(time))

    if (!(tags && tags.length > 0)) {
      console.log('getScheduleableTagsScipt returned no tags, falling back to legacy defaults')
      return 
    }

    console.log('getScheduleableTagsScipt got', tags.length, 'tags', tags)

    const filtered = tags.filter(t => t).map(t => ({ ...t, scheduleable: true }))

    console.log('getScheduleableTagsScipt got', filtered.length, 'filtered', tags)

    return filtered
  } catch (e) {
    console.log('getScheduleableTagsScipt evaluation error', e)
  }
}
