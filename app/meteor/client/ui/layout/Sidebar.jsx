import React from 'react'
import { Link, withRouter } from 'react-router'
import FlipMove from 'react-flip-move'
import { TAPi18n } from 'meteor/tap:i18n'

const SidebarItem = withRouter(({ item, router }) => {
  return (
    <li className={router.isActive(`/${item.name}`) && 'active'}>
      <Link
        to={`/${item.name}`}
        className="pointer level-0 link"
        title={TAPi18n.__(`${item.name}.this`)}>
        <i className={`fa fa-${item.icon}`}></i>
        <span>{TAPi18n.__(`${item.name}.this`)}</span>
        <FlipMove typeName="span">
          {
            item.count && item.count > 0
            ? <small key={item.count} className="label pull-right label-primary">{item.count}</small>
          : (item.subItems && <i key="subItems" className="i fa fa-angle-left pull-right">&emsp;</i>)
          }
        </FlipMove>
      </Link>
      {item.subItems &&
        <ul className="treeview-menu">
          {item.subItems.map((subItem) => (
            <li key={subItem.name} className={router.isActive(`/${item.name}${subItem.path}`, true) && 'active level-1 link'}>
              <Link
                to={`/${item.name}${subItem.path}`}
                className="level-1 link"
                title={TAPi18n.__([item.name, subItem.name].join('.'))}>
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
          <li className="header text-center">{this.props.customerName}</li>
          {this.props.items.map((item) => (
            <SidebarItem key={item.name} item={item} handleItemClick={this.handleItemClick} handleSubItemClick={this.handleSubItemClick} />
          ))}
        </ul>
      </aside>
    )
  }
}
