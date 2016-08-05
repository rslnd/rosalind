import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { List, ListItem } from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Avatar from 'material-ui/Avatar'
import { Box } from 'client/ui/components/Box'

export const StatusBoard = ({ groups, weekday }) => (
  <div className="content">
    <Box noPadding>
      {groups.map((g) => (
        <List key={g.group._id}>
          <Subheader>{g.group.name}</Subheader>
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
