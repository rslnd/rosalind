Ground.Collection(Meteor.users);

Schema.UserProfile = new SimpleSchema({
  firstName: {
    type: String,
    optional: true
  },
  lastName: {
    type: String,
    optional: true
  },
  titlePrepend: {
    type: String,
    optional: true
  },
  titleAppend: {
    type: String,
    optional: true
  },
  birthday: {
    type: Date,
    optional: true
  },
  gender: {
    type: String,
    allowedValues: ['Male', 'Female'],
    optional: true
  },
  employee: {
    type: Boolean,
    optional: true
  },
});

Schema.User = new SimpleSchema({
  username: {
    type: String,
    regEx: /^[a-z0-9A-Z_]*$/,
  },
  groupId: {
    type: SimpleSchema.RegEx.Id,
    autoform: { options: Groups.all },
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true,
    autoValue: Util.autoCreatedAt
  },
  profile: {
    type: Schema.UserProfile,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  // Add `roles` to your schema if you use the meteor-roles package.
  // Option 1: Object type
  // If you specify that type as Object, you must also specify the
  // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
  // Example:
  // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
  // You can't mix and match adding with and without a group since
  // you will fail validation in some cases.
  roles: {
    type: Object,
    optional: true,
    blackbox: true
  },
  status: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

Meteor.users.attachSchema(Schema.User);

Meteor.users.helpers({
  lastActivity() {
    if (this.status && this.status.lastActivity)
      return TAPi18n.__('ui.status.lastActivity') + ' ' + moment(this.status.lastActivity).fromNow();
    else if (this.status && this.status.online)
      return TAPi18n.__('ui.status.online');
    else if (this.status && this.status.lastLogin && this.status.lastLogin.date)
      return TAPi18n.__('ui.status.lastLogin') + ' ' + moment(this.status.lastLogin.date).fromNow();
    else
      return TAPi18n.__('ui.status.never');
  },
  shortname() {
    if (this.username.length <= 3)
      return this.username;
    else
      return _.map(this.fullName().split(' '), function(n) { return n.charAt(0); }).join('');
  },
  firstName() {
    if (this.profile && this.profile.firstName)
      return this.profile.firstName;
    else
      return this.fullName();
  },
  fullName() {
    if (this.profile && this.profile.lastName && this.profile.firstName)
      return this.profile.firstName + ' ' + this.profile.lastName;
    else if (this.profile && this.profile.lastName)
      return this.profile.lastName;
    else if (this.profile && this.profile.firstName)
      return this.profile.firstName;
    else
      return this.username;
  },
  fullNameWithTitle(overrideFullName) {
    let fullName = overrideFullName || this.fullName();

    if (this.profile && this.profile.titleAppend && this.profile.titlePrepend)
      return this.profile.titlePrepend + ' ' + fullName + ', ' + this.profile.titleAppend;
    if (this.profile && this.profile.titlePrepend)
      return this.profile.titlePrepend + ' ' + fullName;
    if (this.profile && this.profile.titleAppend)
      return fullName + ', ' + this.profile.titleAppend;
    else
      return this.fullName();
  },
  lastNameWithTitle() {
    if (this.profile && this.profile.lastName)
      return this.fullNameWithTitle(this.profile.lastName);
    else
      return this.fullName();
  },
  group() {
    let group = Groups.findOne(this.groupId);
    if (group)
      return group.name;
  },
  getRoles() {
    return Roles.getRolesForUser(this._id).join(', ');
  },
  collection() {
    return Meteor.users;
  }
});

Meteor.users.findOneByIdOrUsername = function(idOrUsername) {
  if (typeof idOrUsername === 'string') {
    let byId = Meteor.users.findOne(idOrUsername);
    if (byId)
      return byId;

    let byUsername = Meteor.users.findOne({username: idOrUsername});
    if (byUsername)
      return byUsername;

  } else if (typeof idOrUsername === 'object') {
    let byPassthrough = (idOrUsername && idOrUsername.collection._name && (idOrUsername.collection._name === 'users'));
    if (byPassthrough)
      return idOrUsername;

    let byCursor = (idOrUsername && idOrUsername.fetch && idOrUsername.fetch()[0]);
    if (byCursor)
      return idOrUsername.fetch()[0];
  }
};

Meteor.users.byGroup = function(selector = {}) {
  return _.map(Groups.find({}).fetch(), (g) => {
    return { group: g.name, users: g.users() };
  });
};

TabularTables.Users = new Tabular.Table({
  name: 'Users',
  collection: Meteor.users,
  columns: [
    {data: 'status', tmpl: Meteor.isClient && Template.status},
    {data: 'profile.lastName', title: 'Name', render: (val, type, doc) => { return doc.fullNameWithTitle(); }},
    {data: 'getRoles()', title: 'Berechtigungen'},
    {data: 'group()', title: 'Gruppe'},
    {data: 'lastActivity()', title: 'Zuletzt gesehen'},
    {data: '_id', render: (val) => { return '<a href="/users/' + val + '/edit">Bearbeiten</a>'; } }
  ],
  order: [[0, 'asc'], [2, 'asc']],
  extraFields: ['profile', 'username', 'groupId'],
  allow: (userId) => {
    return Roles.userIsInRole(userId, ['admin']);
  }
});

Schema.UserLogin = new SimpleSchema({
  name: {
    type: String
  },
  password: {
    type: String,
    min: 2
  }
});

Schema.UserCreate = new SimpleSchema({
  username: {
    type: String
  }
});

Schema.UserUpdatePassword = new SimpleSchema({
  password: {
    type: String
  },
  userId: {
    type: String
  }
});

Schema.UserUpdateRoles = new SimpleSchema({
  roles: {
    type: String
  },
  userId: {
    type: String
  }
});

Meteor.startup(function() {
  Schema.UserProfile.i18n('user.profile');
  Schema.User.i18n('user');
  Schema.UserLogin.i18n('login.form');
});

Accounts.config({
  forbidClientAccountCreation: true
});
