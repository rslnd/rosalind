Package.describe({
  git: 'https://github.com/zimme/meteor-collection-behaviours.git',
  name: 'zimme:collection-behaviours',
  summary: 'Define and attach behaviours to collections',
  version: '1.1.3'
});

Package.onUse(function(api) {
  api.use([
    'check',
    'coffeescript',
    'mongo'
  ]);

  api.addFiles([
    'lib/behaviours.coffee',
    'lib/mongo.coffee'
  ]);

  api.export('CollectionBehaviours');
});
