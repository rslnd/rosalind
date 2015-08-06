#= require cable
#= require_self
#= require_tree .

@App = {}
App.cable = Cable.createConsumer gon.websocket_url
