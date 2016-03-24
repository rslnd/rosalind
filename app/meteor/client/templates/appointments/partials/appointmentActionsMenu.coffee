Template.appointmentActionsMenu.events
  'click [rel="actions"]': ->
    Modal.show('appointmentEdit', Template.parentData())
