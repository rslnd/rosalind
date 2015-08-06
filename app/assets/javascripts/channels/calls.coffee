App.calls = App.cable.subscriptions.create 'CallsChannel',
  received: (data) ->
    $('#calls').replaceWith(data.calls)
