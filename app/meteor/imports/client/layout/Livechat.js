// import React from 'react'
// import ChatWidget from '@papercups-io/chat-widget'
// import { fullNameWithTitle } from '../../api/users/methods'
// import { Meteor } from 'meteor/meteor'
// import { getClient } from '../../api/clients/methods/getClient'

// const userToCustomer = (user) => {
//   if (!user) { return undefined }
//   const customerPrefix = Meteor.settings.public.CUSTOMER_PREFIX
//   const customerName = Meteor.settings.public.CUSTOMER_NAME
//   const client = getClient()

//   return {
//     name: [customerPrefix, fullNameWithTitle(user)].join(' '),
//     external_id: user._id,
//     metadata: {
//       customer_prefix: customerPrefix,
//       client_id: client && client._id,
//       customer_name: customerName
//     }
//   }
// }

export const Livechat = ({ primaryColor, currentUser }) =>
  null

  // <ChatWidget
//     accountId='e2a32634-6284-4aa5-b2fa-ae46295f484a'
//     title='Welcome to Papercups!'
//     subtitle='Ask us anything in the chat window below 😊'
//     newMessagePlaceholder='Start typing...'
//     primaryColor={primaryColor}
//     greeting='Hi there! How can I help you?'
//     customer={userToCustomer(currentUser)}
//     // Optionally specify the base URL
//     baseUrl='https://app.papercups.io'
//     requireEmailUpfront={false}
//     showAgentAvailability={false}
//   />
