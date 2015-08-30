AdminConfig = {
  skin: 'red',
  collections: {
    InboundCalls: {
      icon: 'phone',
      color: 'red',
      omitFields: ['createdAt', 'updatedAt', 'createdBy']
    },
    'Meteor.users': {
      omitFields: ['createdAt'],
      tableColumns: [
       { label: '', name: 'status', template: 'status' },
       { label: 'Username', name: 'username' },
       { label: 'Name', name: 'fullNameWithTitle()' },
       { label: 'Last activity', name: 'lastActivity()'},
       { label: 'IP', name: 'status.lastLogin.ipAddr'},
     ],
      showDelColumn: false,
      showWidget: false
    }
  }
};
