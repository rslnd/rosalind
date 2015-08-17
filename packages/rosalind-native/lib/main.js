'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

var mainWindow = null;

app.on('ready', function() {
  var electronScreen = require('screen');
  var display = electronScreen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    x: display.x,
    y: display.y,
    width: display.width,
    height: display.height,
    'min-width': 560,
    'min-height': 426,
    'disable-auto-hide-cursor': true,
    'node-integration': false,
    'preload': require.resolve('./native.js'),
    'web-preferences': {
      'text-areas-are-resizable': false,
      'experimental-canvas-features': true,
      'subpixel-font-scaling': true,
      'overlay-scrollbars': false
    }
  });

  mainWindow.loadUrl('http://127.0.0.1:3000');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
