var ical = require('../');
var assert = require('assert');

test('parse line - invalid', function() {
  assert.ok(!ical.parse_line(''));
  assert.ok(!ical.parse_line('UID'));
});

test('parse line - valid', function() {
  var parsed = ical.parse_line('UID:FOO');
  assert.equal(parsed.name, 'UID');
  assert.equal(parsed.value, 'FOO');

  var parsed = ical.parse_line('NAME;CHARSET=utf-8:VALUE');
  assert.equal(parsed.name, 'NAME');
  assert.deepEqual(parsed.params, { 'CHARSET': 'utf-8' });
  assert.equal(parsed.value, 'VALUE');

  // colon in value
  var parsed = ical.parse_line('NAME;CHARSET=utf-8:VALUE:with colon');
  assert.equal(parsed.name, 'NAME');
  assert.equal(parsed.value, 'VALUE:with colon');
});
