import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { List, ListItem } from 'material-ui/List'
import ListSubheader from 'material-ui/List/ListSubheader'
import Avatar from 'material-ui/Avatar'
import { Box } from '../../components/Box'

export const StatusBoard = ({ groups, weekday }) => (
  <div className='content'>
    <Box noPadding>
      {groups.map((g) => (
        <List key={g.group._id}>
          <ListSubheader>{g.group.name}</ListSubheader>
          {g.users.map(({ user, schedule, timesheets }) => (
            <ListItem
              key={user._id}
              leftAvatar={<Avatar backgroundColor={
                timesheets.isTracking ? '#00a65a' : (
                  timesheets.sum > 0 ? '#f39c12' : (
                    schedule.unavailableToday && '#dd4b39'
                  )
                )
              }>{user.shortname}</Avatar>}
              rightIcon={<span>ON</span>}
              primaryText={user.fullNameWithTitle}
              secondaryText={<span>
                {timesheets.sum > 0 &&
                  <span>
                    {timesheets.sumFormatted}
                    &nbsp;({timesheets.stringified})
                    &nbsp;{TAPi18n.__('timesheets.actual')}
                    <br />
                  </span>
                }
                {schedule.sum}h
                &nbsp;({schedule.stringified})
                &nbsp;{TAPi18n.__('schedules.planned')}
              </span>}
            />
          ))}
        </List>
      ))}
    </Box>
  </div>
)
