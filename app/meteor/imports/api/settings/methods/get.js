import { Meteor } from 'meteor/meteor'

// Client: synchronous minimongo read so it stays reactive inside trackers/render.
// Server: async read (Meteor 3 has no synchronous Mongo on the server); callers await.
export const get = ({ Settings }) => Meteor.isServer
  ? async (key) => {
    if (!key) { return }
    const existingSetting = await Settings.findOneAsync({ key })
    if (existingSetting) {
      return existingSetting.value
    }
  }
  : (key) => {
    if (!key) { return }
    const existingSetting = Settings.findOne({ key })
    if (existingSetting) {
      return existingSetting.value
    }
  }
