const sidebar = [
  {
    name: 'inboundCalls.this',
    icon: 'phone',
    countBadge: 'inboundCalls',
    submenu: [
      { name: 'inboundCalls.this', link: '/inboundCalls' },
      { name: 'inboundCalls.new', link: '/inboundCalls/new' }
    ]
  }
];

Template.sidebar.helpers({
  sidebar() { return sidebar; }
})
