Template.newInboundCall.events({
    'submit form': function(e) {
        e.preventDefault();
        var data = SimpleForm.processForm(e.target);
        InboundCalls.insert(data);
    }
});
