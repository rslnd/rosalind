(function () {

  'use strict';

  Meteor.methods({
    'fixtures/createRecord': function(options) {
      check(options, Object);

      if (process.env.NODE_ENV !== 'development')
        throw 'Testing code somehow made it into production';

      var collection, attributes;

      collection = _.pluralize(options.collection);
      collection = TestUtil.camelize(collection);
      collection = TestUtil.constantize(collection);

      attributes = TestUtil.transformAttributes(options.attributes);

      collection.insert(attributes);
    }
  });

})();
