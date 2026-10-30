Package.describe({
  git: 'https://github.com/zimme/meteor-collection-softremovable.git',
  name: 'zimme:collection-softremovable',
  summary: 'Add soft remove to collections',
  version: '2.0.0'
});

Package.onUse(function(api) {
  api.versionsFrom(['2.16', '3.0']);

  api.use([
    'ecmascript',
    'check'
  ]);

  api.use([
    'matb33:collection-hooks@2.0.0',
    'zimme:collection-behaviours@2.0.0',
    'aldeed:simple-schema'
  ]);

  api.use([
    'aldeed:collection2@4.0.0'
  ], ['client', 'server'], {weak: true});

  api.imply('zimme:collection-behaviours');

  api.mainModule('softremovable.js');
});
