import identity from 'lodash/identity'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { withRouter } from 'react-router-dom'
import { process as server } from 'meteor/clinical:env'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Counts } from 'meteor/tmeasday:publish-counts'
import { Calendars } from '../../api/calendars'
import { Sidebar } from './Sidebar'

const sidebarItems = ({ history }) => {
  const calendars = Calendars.find().fetch()

  return [
    {
      name: 'patients.thisNext',
      link: '/waitlist',
      icon: 'angle-right',
      roles: ['waitlist', 'waitlist-all', 'admin']
    },
    {
      name: 'appointments',
      icon: 'calendar',
      roles: ['admin', 'appointments'],
      subItems: calendars.map(c => ({
        name: c.slug,
        label: c.name,
        path: '/' + c.slug,
        slug: c.slug
      })),
      // replace calendar slug and keep selected date
      onClick: ({subItem, location}) => {
        const [base, calendar, date] = location.pathname
          .split('/').filter(x => x.length > 0)
        const newPath = '/' + [base, subItem.slug, date].filter(identity).join('/')
        history.push(newPath)
      }
    },
    {
      name: 'inboundCalls',
      icon: 'phone',
      roles: ['admin', 'inboundCalls'],
      countBadge: 'inboundCalls',
      subItems: [
        { name: 'thisOpen' },
        { name: 'thisResolved', path: '/resolved' },
        { name: 'thisNew', path: '/new' }
      ]
    },
    // {
    //   name: 'schedules',
    //   icon: 'user-md',
    //   roles: ['admin', 'schedules'],
    //   subItems: [
    //     { name: 'statusBoard' },
    //     { name: 'timesheets', path: '/timesheets' },
    //     { name: 'requests.this', path: '/requests' },
    //     { name: 'thisDefault', path: '/default' },
    //     { name: 'override', path: '/override' },
    //     { name: 'businessHours', path: '/businessHours' },
    //     { name: 'holidays', path: '/holidays' }
    //   ]
    // },
    {
      name: 'reports',
      icon: 'bar-chart',
      roles: ['admin', 'reports'],
      subItems: [
        { name: 'dashboard', path: '/day' },
        { name: 'assignees', path: '/assignee' }
      ]
    },
    {
      name: 'users',
      icon: 'unlock-alt',
      roles: ['admin', 'edit-users'],
      subItems: [
        { name: 'thisAll' },
        { name: 'thisNew', path: '/new' }
      ]
    },
    {
      name: 'patients',
      icon: 'user-plus',
      roles: ['admin', 'patients'],
      subItems: [
        { name: 'thisUpsert' }
      ]
    },
    {
      name: 'system',
      icon: 'server',
      roles: ['admin', 'system'],
      subItems: [
        { name: 'thisEvents', path: '/events' },
        { name: 'thisClients', path: '/clients' },
        { name: 'thisCalendars', path: '/calendars' },
        { name: 'thisConstraints', path: '/constraints' },
        { name: 'thisTags', path: '/tags' },
        { name: 'thisMessages', path: '/messages' },
        { name: 'thisSettings', path: '/settings' },
        { name: 'thisImporters', path: '/importers' },
        { name: 'thisNative', path: '/native', only: () => window.native }
      ]
    }
  ]
}

const composer = (props, onData) => {
  const items = sidebarItems(props).filter((item) => {
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

export const SidebarContainer = withRouter(composeWithTracker(composer)(Sidebar))
