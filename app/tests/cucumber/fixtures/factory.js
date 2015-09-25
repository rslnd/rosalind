(function () {

  'use strict';

  Meteor.methods({
    'fixtures/createRecord': function(options) {
      check(options, Object);

      if (!process.env.IS_MIRROR || process.env.NODE_ENV !== 'development')
        throw 'Testing code somehow made it into production';

      var collection, attributes;

      collection = _.pluralize(options.collection);
      collection = TestUtil.camelize(collection);
      collection = TestUtil.constantize(collection);

      attributes = TestUtil.transformAttributes(options.attributes);

      collection.insert(attributes);
    },

    // taken from xolvio:cleaner
    'fixtures/resetDatabase': function() {
      if (!process.env.IS_MIRROR || process.env.NODE_ENV !== 'development')
        throw 'Testing code somehow made it into production';

      var collectionsRemoved = 0;
      var db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;

      db.collections(function (err, collections) {
        var appCollections = _.reject(collections, function (col) {
          return col.collectionName.indexOf('velocity') === 0 ||
            col.collectionName === 'system.indexes';
        });
        if (appCollections.length > 0) {
          _.each(appCollections, function (appCollection) {
            var collectionCanonicalName = db.databaseName + '.' + appCollection.collectionName;
            appCollection.remove(function (e) {
              if (e) {
                console.error('Failed removing collection', collectionCanonicalName, e);
                return;
              }
              collectionsRemoved++;
              if (appCollections.length === collectionsRemoved)
                return;
            });
          });
        } else {
          return;
        }
      });
      return;
    }
  });

})();
