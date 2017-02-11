export const send = (message) => {
  console.log('[Messages] channels/sms/stub: Sending SMS to', message.to, `"${message.text}"`, message._id)

  return new Promise((resolve, reject) => {
    if (Math.random() < 0.05) {
      setTimeout(() => reject({ error: 'something occured', code: 500 }), 8000 * Math.random())
    } else {
      setTimeout(() => resolve({ response: 'sent ok', code: 200 }), 4000 * Math.random())
    }
  })
}

export const receive = (payload) => {
  console.log('[Messages] channels/sms/stub: Receiving payload', payload)
  return {
    from: '0043123456789',
    text: 'Inbound SMS stub test text'
  }
}

export default { send, receive }
