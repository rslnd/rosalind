import { composeWithTracker } from 'react-komposer'
import { Sidebar } from './sidebar'

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
      icon: 'user-md'
    },
    {
      name: 'reports',
      icon: 'bar-chart'
    },
    {
      name: 'users',
      icon: 'unlock-alt'
    },
    {
      name: 'system',
      icon: 'server'
    }
  ]
}

const composer = (props, onData) => {
  const items = sidebarItems()
  onData(null, { items })
}

export const SidebarContainer = composeWithTracker(composer)(Sidebar)
