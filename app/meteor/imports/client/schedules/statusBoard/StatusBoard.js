import React from 'react'
import { __ } from '../../../i18n'
import { List, ListItem } from 'material-ui/List'
import ListSubheader from 'material-ui/List/ListSubheader'
import Avatar from 'material-ui/Avatar'
import { Box } from '../../components/Box'
import { shortname } from '../../../api/users/methods/name'

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
              }>{shortname(user)}</Avatar>}
              rightIcon={<span>ON</span>}
              primaryText={user.fullNameWithTitle}
              secondaryText={<span>
                {timesheets.sum > 0 &&
                  <span>
                    {timesheets.sumFormatted}
                    &nbsp;({timesheets.stringified})
                    &nbsp;{__('timesheets.actual')}
                    <br />
                  </span>
                }
                {schedule.sum}h
                &nbsp;({schedule.stringified})
                &nbsp;{__('schedules.planned')}
              </span>}
            />
          ))}
        </List>
      ))}
    </Box>
  </div>
)
