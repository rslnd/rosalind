export const isIntentToCancel = (text) => {
  return !!text.match(/^STORNO$/i)
}
