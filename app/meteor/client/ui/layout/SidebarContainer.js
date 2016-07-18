import { composeWithTracker } from 'react-komposer'
import { Sidebar } from './Sidebar'

const sidebarItems = () => {
  return [
    {
      name: 'inboundCalls',
      icon: 'phone',
      subItems: [
        { name: 'thisOpen', path: '/' },
        { name: 'thisResolved', path: '/resolved' },
        { name: 'thisNew', path: '/new' }
      ]
    },
    {
      name: 'schedules',
      icon: 'user-md',
      subItems: [
        { name: 'thisDefault', path: '/' },
        { name: 'override', path: '/override' },
        { name: 'businessHours', path: '/businessHours' },
        { name: 'holidays', path: '/holidays' }
      ]
    },
    {
      name: 'reports',
      icon: 'bar-chart',
      subItems: [
        { name: 'dashboard', path: '/' }
      ]
    },
    {
      name: 'users',
      icon: 'unlock-alt',
      subItems: [
        { name: 'thisAll', path: '/' },
        { name: 'thisNew', path: '/new' }
      ]
    },
    {
      name: 'system',
      icon: 'server',
      subItems: [
        { name: 'thisEvents', path: '/events' },
        { name: 'thisStats', path: '/stats' },
        { name: 'thisImporters', path: '/importers' },
        { name: 'thisJobs', path: '/jobs' },
        { name: 'thisTags', path: '/tags' },
        { name: 'thisNative', path: '/native', only: () => window.native }
      ]
    }
  ]
}

const composer = (props, onData) => {
  const items = sidebarItems()
  onData(null, { items })
}

export const SidebarContainer = composeWithTracker(composer)(Sidebar)
