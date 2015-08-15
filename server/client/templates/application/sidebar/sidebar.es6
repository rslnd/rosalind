const sidebar = [
  {
    name: 'Inbound calls',
    icon: 'phone',
    submenu: [
      { name: 'Inbound calls', link: '/inboundCalls' },
      { name: 'New inbound call', link: '/inboundCalls/new' }
    ]
  }
];

Template.sidebar.helpers({
  sidebar() { return sidebar; }
})
