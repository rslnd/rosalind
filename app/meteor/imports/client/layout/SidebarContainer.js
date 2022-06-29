import identity from 'lodash/identity'
import { withTracker } from '../components/withTracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Calendars } from '../../api/calendars'
import { InboundCallsTopics, InboundCalls } from '../../api/inboundCalls'
import { Sidebar } from './Sidebar'
import { hasRole } from '../../util/meteor/hasRole'
import { sumBy } from 'lodash/fp'
import { subscribe } from '../../util/meteor/subscribe'

const sidebarItems = ({ history }) => {
  const calendars = Calendars.find({}, { sort: { order: 1 } }).fetch()
  const inboundCallsTopics = InboundCallsTopics.find({}, { sort: { order: 1 } }).fetch()

  return [
    {
      name: 'patients.thisNext',
      link: '/waitlist',
      icon: 'angle-double-right',
      roles: ['waitlist', 'waitlist-all', 'admin']
    },
    ...calendars.map((c, i) => ({
      shouldNavigateHereAfterLoad: true,
      label: c.name,
      color: c.color,
      icon: c.icon,
      link: '/appointments/' + c.slug,
      slug: c.slug,
      roles: [`calendar-${c.slug}`, 'calendars'],
      // replace calendar slug and keep selected date
      onClick: ({ item, location }) => {
        const [base, _calendar, date] = location.pathname // eslint-disable-line
          .split('/').filter(x => x.length > 0)

        const newPath =
          base === 'appointments'
            ? '/' + [base, item.slug, date].filter(identity).join('/')
            : item.link

        history.push(newPath)
      }
    })),
    {
      separator: true
    },
    {
      name: 'inboundCalls',
      icon: 'phone',
      roles: ['inboundCalls', 'inboundCalls-topic-*'],
      count: 'sum',
      linkToFirstSubItem: true,
      subItems: [
        {
          name: 'thisOpen',
          roles: ['inboundCalls', 'inboundCalls-topic-null'],
          count: inboundCallsTopics.length > 0
            ? InboundCalls.find({ topicId: null }).count()
            : null
        },
        ...inboundCallsTopics.map(t => {
          return {
            roles: ['inboundCalls', 'inboundCalls-topic-' + t.slug],
            count: InboundCalls.find({ topicId: t._id }).count(),
            label: t.labelShort || t.label,
            path: `/topic/${t.slug}`
          }
        }).filter(identity),
        { name: 'thisResolved', path: '/resolved' },
        { name: 'thisNew', path: '/new' }
      ]
    },
    {
      name: 'checkups',
      icon: 'thermometer-3',
      roles: ['admin', 'checkups', 'checkups-edit'],
      link: '/checkups'
    },
    {
      name: 'schedules',
      icon: 'clock-o',
      roles: ['admin', 'schedules-edit'],
      subItems: [
        ...calendars.map(c => ({
          name: c.slug,
          label: c.name,
          path: '/default/' + c.slug,
          slug: c.slug
        })),
        { name: 'commonHolidays', path: '/holidays' },
        { name: 'constraints', path: '/constraints' }
      ]
    },
    {
      name: 'reports',
      icon: 'bar-chart',
      roles: ['admin', 'reports'],
      subItems: [
        { name: 'dashboard', path: '/day' },
        { name: 'assignees', path: '/assignee' },
        { name: 'referrals', path: '/referrals' }
      ]
    },
    {
      name: 'users',
      icon: 'unlock-alt',
      roles: ['admin', 'users-edit'],
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
        { name: 'thisTags', path: '/tags' },
        { name: 'thisCalendars', path: '/calendars' },
        { name: 'missingConsents', path: '/consents' },
        { name: 'thisClients', path: '/clients' },
        { name: 'thisTemplates', path: '/templates' },
        { name: 'thisEvents', path: '/events' },
        { name: 'thisMediaTags', path: '/mediaTags' },
        { name: 'thisInboundCallsTopics', path: '/inboundCallsTopics' },
        { name: 'thisReferrables', path: '/referrables' },
        { name: 'thisMessages', path: '/messages' },
        { name: 'thisSettings', path: '/settings' },
      ]
    }
  ]
}

let didNavigationAfterLoad = false


const composer = (props) => {
  const items = sidebarItems(props).filter((item) => {
    return (!item.roles || (item.roles && hasRole(Meteor.userId(), item.roles)))
  }).map(item => {
    const subItems = item.subItems && item.subItems.filter(subItem => {
      return (!subItem.roles || (subItem.roles && hasRole(Meteor.userId(), subItem.roles)))
    })

    return {
      ...item,
      subItems,
      link: (item.linkToFirstSubItem && subItems && subItems[0])
        ? '/' + [item.name, (subItems[0].path)].join('')
        : item.link,
      count: (item.count === 'sum' && subItems)
        ? subItems.reduce((acc, s) => {
          if (s.count && s.count > 0) {
            return acc + s.count
          } else {
            return acc
          }
        }, 0)
        : item.count
    }
  })

  const subsReady = (
    subscribe('calendars').ready() &&
    subscribe('users').ready()
  )

  // Don't navigate away when custom url was loaded
  if (subsReady && !didNavigationAfterLoad && window.location.pathname !== '/') {
    console.log('[Sidebar] Will not navigate away from', window.location.pathname)
    didNavigationAfterLoad = true
  }

  if (subsReady && !didNavigationAfterLoad &&
    items &&
    items.length >= 1 &&
    (
      items.find(i => i.shouldNavigateHereAfterLoad && i.link) ||
      items[0].link
    )
  ) {
    const item = (items.find(i => i.shouldNavigateHereAfterLoad) || items[0])
    console.log('[Sidebar] Navigating to first item', item.link)
    didNavigationAfterLoad = true
    props.history.replace(item.link)
  }

  const customerName = Meteor.settings.public.CUSTOMER_NAME || 'Rosalind Development'

  return { ...props, items, customerName }
}

export const SidebarContainer = withRouter(withTracker(composer)(Sidebar))
