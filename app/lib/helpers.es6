Helpers = {}

Helpers.getFirstName = function(userId) {
  if (typeof userId === 'string') {
    let user = Meteor.users.findOne(userId)
    return user && user.firstName();
  }
};

// Split phone number at whitespaces. If the word contains a number,
// replace all letters 'O' or 'o' with zeroes. Join back together.
Helpers.zerofix = function(telephone) {
  if (telephone) {
    return _.map(telephone.split(/\s/g), (word) => {
      return word.match(/\d/g) ? word.replace(/o/gi, '0') : word;
    }).join(' ');
  }
};
