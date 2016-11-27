import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { withRouter } from 'react-router'
import { process as server } from 'meteor/clinical:env'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Counts } from 'meteor/tmeasday:publish-counts'
import { Sidebar } from './Sidebar'

const sidebarItems = () => {
  return [
    {
      name: 'appointments',
      icon: 'calendar',
      roles: ['admin', 'appointments'],
      subItems: [
        { name: 'thisCalendar', path: '/' }
      ]
    },
    {
      name: 'inboundCalls',
      icon: 'phone',
      roles: ['admin', 'inboundCalls'],
      countBadge: 'inboundCalls',
      subItems: [
        { name: 'thisOpen', path: '/' },
        { name: 'thisResolved', path: '/resolved' },
        { name: 'thisNew', path: '/new' }
      ]
    },
    {
      name: 'schedules',
      icon: 'user-md',
      roles: ['admin', 'schedules'],
      subItems: [
        { name: 'statusBoard', path: '/' },
        { name: 'timesheets', path: '/timesheets' },
        { name: 'requests.this', path: '/requests' },
        { name: 'thisDefault', path: '/default' },
        { name: 'override', path: '/override' },
        { name: 'businessHours', path: '/businessHours' },
        { name: 'holidays', path: '/holidays' }
      ]
    },
    {
      name: 'reports',
      icon: 'bar-chart',
      roles: ['admin', 'reports'],
      subItems: [
        { name: 'dashboard', path: '/' }
      ]
    },
    {
      name: 'users',
      icon: 'unlock-alt',
      roles: ['admin', 'users'],
      subItems: [
        { name: 'thisAll', path: '/' },
        { name: 'thisNew', path: '/new' }
      ]
    },
    {
      name: 'system',
      icon: 'server',
      roles: ['admin', 'system'],
      subItems: [
        { name: 'thisEvents', path: '/events' },
        { name: 'thisImporters', path: '/importers' },
        { name: 'thisTags', path: '/tags' },
        { name: 'thisNative', path: '/native', only: () => window.native }
      ]
    }
  ]
}

const composer = (props, onData) => {
  const items = sidebarItems().filter((item) => {
    return (!item.roles || item.roles && Roles.userIsInRole(Meteor.user(), item.roles))
  }).map((item) => {
    if (item.countBadge) {
      const count = Counts.get(item.countBadge)
      return { ...item, count }
    } else {
      return item
    }
  })

  const customerName = server.env.CUSTOMER_NAME || 'Rosalind Development'

  onData(null, { ...props, items, customerName })
}

export const SidebarContainer = composeWithTracker(composer)(withRouter(Sidebar))
