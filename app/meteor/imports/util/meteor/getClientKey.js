import idx from 'idx'

export const getClientKey = () =>
  idx(window, _ => _.native.clientKey) ||
  idx(window, _ => _.native.settings.clientKey) ||
  null
