import { v4 as uuidv4 } from 'uuid'

// Temporarily allow authenticated connections from trusted networks when requested (eg for printing reports on server)
let trustedAccessTokens = []

export const withTrustedAccessToken = async fn => {
  const trustedAccessToken = addTrustedAccessToken()
  let result = null
  try {
    result = await fn(trustedAccessToken)
  } catch (e) {
    console.error('[Publish] withTrustedAccessToken: ')
    revokeTrustedAccessTokens(trustedAccessToken)
    throw e
  }
  return result
}

export const isTrustedAccessToken = accessToken =>
  typeof accessToken === 'string' &&
  trustedAccessTokens.indexOf(accessToken) !== -1

const addTrustedAccessToken = () => {
  console.log('[Publish] trustedAccessTokens: Adding new token')
  const trustedAccessToken = uuidv4() + uuidv4()
  trustedAccessTokens = [
    ...trustedAccessTokens,
    trustedAccessToken
  ]

  // Start timer to quietly revoke access token after 5 mins, if not revoked already
  setTimeout(() => {
    const index = trustedAccessTokens.indexOf(trustedAccessToken)
    if (index !== -1) {
      trustedAccessTokens = trustedAccessTokens.slice(index, 1)
    }
  }, 1000 * 60 * 5)

  return trustedAccessToken
}

const revokeTrustedAccessTokens = (trustedAccessToken) => {
  console.log('[Publish] trustedAccessTokens: Revoking token')
  const index = trustedAccessTokens.indexOf(trustedAccessToken)
  if (index !== -1) {
    trustedAccessTokens = trustedAccessTokens.slice(index, 1)
  } else {
    trustedAccessTokens = []
    throw new Error('[Publish] trustedAccessToken: Requested removal of unknown token, resetting token store')
  }
}
