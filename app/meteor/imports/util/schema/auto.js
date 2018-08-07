import { Meteor } from 'meteor/meteor'

export const createdAt = function () {
  if (this.isInsert) {
    return new Date()
  }

  if (this.isUpsert) {
    return {
      $setOnInsert: new Date()
    }
  }

  return this.unset()
}

export const createdBy = function () {
  try {
    if (this.isInsert) {
      return Meteor.userId()
    }

    if (this.isUpsert) {
      return {
        $setOnInsert: Meteor.userId()
      }
    }

    return this.unset()
  } catch (e) {
    return this.unset()
  }
}
