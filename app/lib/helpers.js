/* global Helpers: true */

Helpers = {};

Helpers.getFirstName = function(userId) {
  if (typeof userId === 'string') {
    let user = Meteor.users.findOne(userId);
    return user && user.firstName();
  }
};

Helpers.getFullName = function(userId) {
  if (typeof userId === 'string') {
    let user = Meteor.users.findOne(userId);
    return user && user.fullName();
  }
};

Helpers.getShortname = function(userId) {
  if (typeof userId === 'string') {
    let user = Meteor.users.findOne(userId);
    return user && user.shortname();
  }
};

// Split phone number at whitespaces. If the word contains a number,
// replace all letters 'O' or 'o' with zeroes. Join back together.
Helpers.zerofix = function(telephone) {
  if (telephone) {
    telephone = _.map(telephone.split(/\s/g), (word) => {
      return word.match(/\d/g) ? word.replace(/o/gi, '0') : word;
    }).join(' ');

    // If it's just a long string of digits, split into groups of 4
    if (telephone.indexOf(' ') === -1 && telephone.match(/\d/g)) {
      return telephone.match(/.{1,4}/g).join(' ');
    } else {
      return telephone;
    }
  }
};
