export const getClientKey = () =>
  window.native &&
    (
      (window.native.settings && window.native.settings.clientKey) ||
      (window.native.clientKey)
    )
