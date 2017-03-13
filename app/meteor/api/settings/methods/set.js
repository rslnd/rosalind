export const set = ({ Settings }) => (key, value) => {
  if (key === undefined || value === undefined) { return }

  const existingSetting = Settings.findOne({ key })
  if (existingSetting) {
    Settings.update({ key }, { $set: { value } })
  } else {
    Settings.insert({ key, value })
  }

  return value
}
