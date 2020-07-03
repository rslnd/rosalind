import Meteor from '@albertzak/react-native-meteor'

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

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
