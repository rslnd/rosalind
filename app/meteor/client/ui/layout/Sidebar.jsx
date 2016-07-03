import React from 'react'
import { Link, withRouter } from 'react-router'
import { TAPi18n } from 'meteor/tap:i18n'
import { RandomMotivationalQuote } from 'client/ui/components/RandomMotivationalQuote'

const SidebarItem = withRouter(({ item, router }) => {
  return (
    <li className={router.isActive(`/${item.name}`) && 'active'}>
      <Link to={`/${item.name}`} className="pointer level-0 link">
        <i className={`fa fa-${item.icon}`}></i>
        <span>{TAPi18n.__(`${item.name}.this`)}</span>
        {item.subItems && <i className="i fa fa-angle-left pull-right"></i>}
      </Link>
      {item.subItems &&
        <ul className="treeview-menu">
          {item.subItems.map((subItem) => (
            <li key={subItem.name} className={router.isActive(`/${item.name}${subItem.path}`, true) && 'active level-1 link'}>
              <Link to={`/${item.name}${subItem.path}`} className="level-1 link">
                <span>{TAPi18n.__([item.name, subItem.name].join('.'))}</span>
              </Link>
            </li>
          ))}
        </ul>
      }
    </li>
  )
})

export class Sidebar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      activeItem: null,
      activeSubItem: null
    }

    this.handleItemClick = this.handleItemClick.bind(this)
    this.handleSubItemClick = this.handleSubItemClick.bind(this)
  }

  handleItemClick (itemName) {
    this.setState({ ...this.getState(), activeItem: itemName })
  }

  handleSubItemClick (itemName) {
    this.setState({ ...this.getState(), activeSubItem: itemName })
  }

  render () {
    return (
      <aside className="main-sidebar sidebar">
        <ul className="sidebar-menu">
          <li className="header text-center"><RandomMotivationalQuote maxLength={25} /></li>
          {this.props.items.map((item) => (
            <SidebarItem key={item.name} item={item} handleItemClick={this.handleItemClick} handleSubItemClick={this.handleSubItemClick} />
          ))}
        </ul>
      </aside>
    )
  }
}
