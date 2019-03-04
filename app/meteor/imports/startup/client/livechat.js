import throttle from 'lodash/throttle'
import Smooch from 'smooch'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { __ } from '../../i18n'
import { Roles } from 'meteor/alanning:roles'
import { Groups } from '../../api/groups'
import { Users } from '../../api/users'
import { getSettings } from '../../api/clients/methods/getSettings'

const getTranslation = () => {
  const keys = [ 'headerText', 'inputPlaceholder', 'sendButtonText',
    'introductionText', 'introAppText', 'settingsText',
    'settingsReadOnlyText', 'settingsInputPlaceholder',
    'settingsSaveButtonText', 'settingsHeaderText', 'settingsNotificationText',
    'actionPostbackError', 'messageError', 'messageIndicatorTitleSingular',
    'messageIndicatorTitlePlural' ]

  let translation = {}

  keys.map((key) => {
    translation[key] = __(['livechat', key].join('.'), {}, 'de')
  })

  return translation
}

const init = () => {
  const avatarUrl = new window.URL('/images/avatar.jpg', window.location.origin).href

  if (Meteor.settings.public.SMOOCH_APP_ID) {
    if (Smooch) {
      Smooch.init({
        appId: Meteor.settings.public.SMOOCH_APP_ID,
        customText: getTranslation(),
        menuItems: {},
        soundNotificationEnabled: false,
        imageUploadEnabled: false,
        businessIconUrl: avatarUrl
      }).then(() => {
        let currentUserId = null
        Tracker.autorun(throttle(() => {
          document.querySelector('body>iframe').style.zoom = 0.8080
          const user = Meteor.user()
          if (user) {
            const env = process.env.NODE_ENV.toUpperCase()
            const smoochUserId = `USER-${user._id}${env === 'PRODUCTION' ? '' : `-${env}`}`

            if (!currentUserId) {
              Meteor.call('livechat/init', { smoochUserId }, (err, jwt) => {
                if (err) {
                  return console.error('[Livechat] Failed to get jwt', err)
                }

                const group = user.groupId && Groups.findOne({ _id: user.groupId })

                Smooch.login(smoochUserId, jwt).then(() => {
                  Smooch.updateUser({
                    givenName: user.firstName,
                    surname: user.lastName,
                    email: user.email,
                    properties: {
                      username: user.username,
                      fullNameWithTitle: Users.methods.fullNameWithTitle(user),
                      employee: user.employee,
                      roles: Roles.getRolesForUser(user._id).join(', '),
                      group: group && group.name
                    }
                  })
                })
              })
            }
            currentUserId = user._id
          } else {
            currentUserId = null
            Smooch.logout().catch((e) => {
              console.error('[Livechat] Failed to logout', e)
            })
          }
        }), 1500)
      }).catch((e) => {
        console.error('[Livechat] Failed to initialize', e)
      })
    }
  }
}

export default () => {
  setTimeout(init, 2000)

  Tracker.autorun(() => {
    const settings = getSettings()
    if (settings && settings.disableLivechat) {
      console.log('[Livechat] Disabling')
      Smooch.destroy()
    }
  })
}
