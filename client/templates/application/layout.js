UI.registerHelper('activeClass', function(context, options) {
  if(context === Router.current().route.path())
    return {class: 'active'};
});

UI.registerHelper('time', function(context, options) {
  if(context) {
    var format = (options.format ? options.format : 'hh:mm');
    return moment(context).format(format);
  }
});

UI.registerHelper('timeAgo', function(context, options) {
  if(context) {
    return moment(context).fromNow();
  }
});
