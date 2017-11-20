import throttle from 'lodash/throttle'
import Smooch from 'smooch'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { process as server } from 'meteor/clinical:env'
import { TAPi18n } from 'meteor/tap:i18n'
import { Groups } from '../../api/groups'

const getTranslation = () => {
  const keys = [ 'headerText', 'inputPlaceholder', 'sendButtonText',
    'introductionText', 'introAppText', 'settingsText',
    'settingsReadOnlyText', 'settingsInputPlaceholder',
    'settingsSaveButtonText', 'settingsHeaderText', 'settingsNotificationText',
    'actionPostbackError', 'messageError', 'messageIndicatorTitleSingular',
    'messageIndicatorTitlePlural' ]

  let translation = {}

  keys.map((key) => {
    translation[key] = TAPi18n.__(['livechat', key].join('.'), {}, 'de')
  })

  return translation
}

const init = () => {
  if (server.env.SMOOCH_APP_ID && !server.env.TEST) {
    if (Smooch) {
      Smooch.init({
        appId: server.env.SMOOCH_APP_ID,
        imageUploadEnabled: false,
        customText: getTranslation()
      }).then(() => {
        let currentUserId = null
        Tracker.autorun(throttle(() => {
          document.querySelector('body>iframe').style.zoom = 0.8080
          const user = Meteor.user()
          if (user) {
            const env = server.env.NODE_ENV.toUpperCase()
            const smoochUserId = `USER-${user._id}${env === 'PRODUCTION' ? '' : `-${env}`}`

            if (!currentUserId) {
              Meteor.call('livechat/init', { smoochUserId }, (err, jwt) => {
                if (err) {
                  return console.error('[Livechat] Failed to get jwt', err)
                }

                const group = user.groupId && Groups.findOne({ _id: user.groupId })

                Smooch.login(smoochUserId, jwt).then(() => {
                  Smooch.updateUser({
                    givenName: user.profile && user.profile.firstName,
                    surname: user.profile && user.profile.lastName,
                    email: user.email,
                    properties: {
                      username: user.username,
                      fullNameWithTitle: user.fullNameWithTitle(),
                      employee: user.profile && user.profile.employee,
                      roles: user.getRoles(),
                      group: group && group.name
                    }
                  })
                })
              })
            }
            currentUserId = user._id
          } else {
            currentUserId = null
            Smooch.logout().then(() => {
              console.log('[Livechat] Logged out')
            }).catch((e) => {
              console.error('[Livechat] Failed to logout', e)
            })
          }
        }), 1500)
      }).then(() => {
        console.log('[Livechat] Initialized')
      }).catch((e) => {
        console.error('[Livechat] Failed to initialize', e)
      })
    }
  }
}

export default () => {
  setTimeout(init, 2000)
}
