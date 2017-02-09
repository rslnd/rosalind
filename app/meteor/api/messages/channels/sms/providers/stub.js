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

export default { send }
