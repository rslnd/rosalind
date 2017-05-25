export const get = ({ Settings }) => (key) => {
  if (!key) { return }

  const existingSetting = Settings.findOne({ key })
  if (existingSetting) {
    return existingSetting.value
  }
}
