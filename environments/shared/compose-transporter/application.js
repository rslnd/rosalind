Source({ name: 'patientsSource', type: 'mongo' })
  .save({ name: 'patientsDestination', type: 'elasticsearch' });
