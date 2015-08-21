Meteor.startup(function () {
  TAPi18n.setLanguage('de-AT');
  moment.locale('de-at');

  Meteor.call('velocity/isMirror', function(err, isMirror) {
    if (isMirror) {
      TAPi18n.setLanguage('en-US');
      moment.locale('en-us');
    };
  });
});
