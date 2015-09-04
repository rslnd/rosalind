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
    }
});

Schema.User = new SimpleSchema({
    username: {
        type: String,
        regEx: /^[a-z0-9A-Z_]*$/,
        optional: true
    },
    emails: {
        type: [Object],
        optional: true,
        blackbox: true
    },
    createdAt: {
        type: Date
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
  getRoles() {
    return Roles.getRolesForUser(this._id).join(', ');
  },
  collectionSlug() {
    return 'users';
  }
});

TabularTables.Users = new Tabular.Table({
  name: 'Users',
  collection: Meteor.users,
  columns: [
    {data: 'status', tmpl: Meteor.isClient && Template.status},
    {data: 'username', title: 'Username'},
    {data: 'profile.firstName', title: 'Vorname'},
    {data: 'profile.lastName', title: 'Nachname'},
    {data: 'getRoles()', title: 'Berechtigungen'},
    {data: 'lastActivity()', title: 'Zuletzt gesehen'},
    {data: 'status.lastLogin.ipAddr', title: 'IP'},
    {tmpl: Meteor.isClient && Template.editLink }
  ],
  order: [[0, 'asc'], [3, 'desc']],
  allow: (userId) => {
    return Roles.userIsInRole(userId, ['admin']);
  },
});

Schema.UserLogin = new SimpleSchema({
  name: {
    type: String,
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
