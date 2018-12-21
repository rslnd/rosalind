import { compose, withState, mapProps } from 'recompose'
import { AsyncStorage } from 'react-native'
import { generateSecureRandom } from 'react-native-securerandom'
import binaryToBase64 from 'binaryToBase64'

const storageKey = '@RosalindCamera:clientKey'

const generateClientKey = async () => {
  const randomBytes = await generateSecureRandom(200)
  const string = binaryToBase64(randomBytes)
  return string.slice(0, 200)
}

const retrieveOrGenerateClientKey = async () => {
  const existingClientKey = await AsyncStorage.getItem(storageKey)

  if (existingClientKey) {
    return existingClientKey
  } else {
    const newClientKey = await generateClientKey()
    AsyncStorage.setItem(storageKey, newClientKey)
    return newClientKey
  }
}

const ensureClientKey = ({ clientKey, setClientKey, ...props }) => {
  if (!clientKey) {
    retrieveOrGenerateClientKey().then(setClientKey)
  }

  return { clientKey, ...props }
}

export const withClientKey = compose(
  withState('clientKey', 'setClientKey', null),
  mapProps(ensureClientKey)
)
