/* global TestUtil: true */

TestUtil = {};

TestUtil.camelize = function(string, firstLower) {
  string = _.titleize(string);
  string = string.split(' ').join('');

  if (firstLower) string = string.charAt(0).toLowerCase() + string.slice(1);

  return string;
};

TestUtil.constantize = function(constantName) {
  if (typeof constantName !== 'string')
    throw new TypeError('Constant name must be a string, was ' + typeof constantName);

  if (constantName.match(/\W|\d/))
    throw new SyntaxError('Constant name must be a valid Javascript name');

  var constant;
  eval('constant = ' + constantName + ';'); // jshint ignore: line
  return constant;
};

TestUtil.typecast = function(s) {
  if (s === 'true') { return true; }
  if (s === 'false') { return false; }
  if (s === parseInt(s).toString()) { return parseInt(s); }
  return s;
};

TestUtil.transformAttributes = function(attributes) {
  var transformedAttributes = {};

  _.each(attributes, function(value, key) {
    if (!key) return;
    key = TestUtil.camelize(key, true);
    value = TestUtil.typecast(value);
    transformedAttributes[key] = value;
  });

  return transformedAttributes;
};
