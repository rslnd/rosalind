const sidebar = [
  {
    name: 'inboundCalls.this',
    icon: 'phone',
    submenu: [
      { name: 'inboundCalls.this', link: '/inboundCalls' },
      { name: 'inboundCalls.new', link: '/inboundCalls/new' }
    ]
  }
];

Template.sidebar.helpers({
  sidebar() { return sidebar; }
})
