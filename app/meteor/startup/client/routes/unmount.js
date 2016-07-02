import { mount } from 'react-mounter'
import { MainLayoutContainer } from 'client/ui/layout'

export const unmount = () => {
  mount(MainLayoutContainer, { main: false })
}
