Util = {}

Util.zerofix = function(telephone) {
  if (telephone) {
    return _.map(telephone.split(/\s/g), (word) => {
      return word.match(/\d/g) ? word.replace(/o/gi, '0') : word;
    }).join(' ');
  }
};

Util.autoCreatedAt = function() {
  if (this.isInsert)
    return new Date;
  else if (this.isUpsert)
    return {$setOnInsert: new Date};
  else
    this.unset();
};

Util.autoCreatedBy = function() {
  if (this.isInsert)
    return Meteor.userId();
  else if (this.isUpsert)
    return {$setOnInsert: Meteor.userId()};
  else
    this.unset();
};
