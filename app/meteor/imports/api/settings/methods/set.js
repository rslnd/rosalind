import { Meteor } from 'meteor/meteor'

export const set = ({ Settings }) => async (key, value, isPublic) => {
  if (key === undefined || value === undefined) { return }

  const existingSetting = await Settings.findOneAsync({ key })
  if (existingSetting) {
    if (isPublic && !existingSetting.isPublic) {
      throw new Meteor.Error(403, `Cannot make setting public: ${key}`)
    } else {
      await Settings.updateAsync({ key }, { $set: { value } })
    }
  } else {
    await Settings.insertAsync({ key, value, isPublic })
  }

  return value
}
