const sidebar = [
  {
    name: 'Inbound Calls',
    icon: 'phone',
    submenu: [
      { name: 'Inbound Calls', link: '/inboundCalls' },
      { name: 'New Inbound Call', link: '/inboundCalls/new' }
    ]
  }
];

Template.sidebar.helpers({
  sidebar() { return sidebar; }
})
