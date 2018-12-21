import Meteor from 'react-native-meteor'

export const call = props => (name, args = {}) => {
  return new Promise((resolve, reject) => {
    const argsWithClientKey = {
      clientKey: props.clientKey,
      ...args
    }

    Meteor.call(name, argsWithClientKey, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}
