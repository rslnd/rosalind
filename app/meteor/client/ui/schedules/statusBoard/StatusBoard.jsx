import React from 'react'
import { List, ListItem } from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Avatar from 'material-ui/Avatar'
import ActionFace from 'material-ui/svg-icons/action/face'
import { Icon } from 'client/ui/components/Icon'
import { Box } from 'client/ui/components/Box'

export const StatusBoard = ({ groups, weekday }) => (
  <div className="content">
    <Box noPadding>
      {groups.map((g) => (
        <List key={g.group._id}>
          <Subheader>{g.group.name}</Subheader>
          {g.users.map(([user, schedule, isTracking]) => (
            <ListItem
              key={user._id}
              leftAvatar={<Avatar backgroundColor={isTracking ? '#00a65a' : '#f39c12'}>{user.shortname()}</Avatar>}
              rightIcon={<span>ON</span>}
              primaryText={user.fullNameWithTitle()}
              secondaryText={<span>
                {parseFloat(schedule.totalHoursPerDay(weekday).toFixed(1))}h &middot; {schedule.stringify(weekday)}
              </span>}
            />
          ))}
        </List>
      ))}
    </Box>
  </div>
)
