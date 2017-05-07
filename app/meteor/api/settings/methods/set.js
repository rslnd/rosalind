import { Meteor } from 'meteor/meteor'

export const set = ({ Settings }) => (key, value, isPublic) => {
  if (key === undefined || value === undefined) { return }

  const existingSetting = Settings.findOne({ key })
  if (existingSetting) {
    if (isPublic && !existingSetting.isPublic) {
      throw new Meteor.Error(403, `Cannot make setting public: ${key}`)
    } else {
      Settings.update({ key }, { $set: { value } })
    }
  } else {
    Settings.insert({ key, value, isPublic })
  }

  return value
}
