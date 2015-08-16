(function() {
  // Make sure we are running inside Electron
  if (typeof require != 'function')
    return;

  require('electron-cookies');
}());
