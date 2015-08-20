const sidebar = [
  {
    name: 'inboundCalls.this',
    icon: 'phone',
    countBadge: 'inboundCalls',
    submenu: [
      { name: 'inboundCalls.thisOpen', link: '/inboundCalls' },
      { name: 'inboundCalls.thisResolved', link: '/inboundCalls/resolved' },
      { name: 'inboundCalls.new', link: '/inboundCalls/new' }
    ]
  }
];

Template.sidebar.helpers({
  sidebar() { return sidebar; }
})
