UI.registerHelper('activeClass', function(context, options) {
  if(context === Router.current().route.path())
    return {class: 'active'};
});
