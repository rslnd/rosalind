Package.describe({
  git: 'https://github.com/zimme/meteor-collection-behaviours.git',
  name: 'zimme:collection-behaviours',
  summary: 'Define and attach behaviours to collections',
  version: '2.0.0'
});

Package.onUse(function(api) {
  api.versionsFrom(['2.16', '3.0']);

  api.use([
    'ecmascript',
    'check',
    'mongo'
  ]);

  api.mainModule('lib/behaviours.js');

  api.export('CollectionBehaviours');
});
