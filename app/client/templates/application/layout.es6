UI.registerHelper('loaded', () => {
  return Session.get('loaded');
});

UI.registerHelper('activeClass', (context, options) => {
  if(context === Router.current().route.path())
    return {class: 'active'};
});

UI.registerHelper('time', (context, options) => {
  if(context) {
    let format = (options.format ? options.format : 'HH:mm');
    return moment(context).format(format);
  }
});

UI.registerHelper('showCount', (context, options) => {
  let counts = Counts.get(context);
  return (counts > 0) ? counts : false;
});

UI.registerHelper('getFirstName', (context, options) => {
  return Helpers.getFirstName(context);
});
