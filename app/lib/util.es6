Util = {}

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
