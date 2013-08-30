var assert = require('assert');
var ical = require('../');

var from_line = function(str) {
  var obj = ical.parse_line(str);
  return ical.datetime(obj.params, obj.value);
}

test('VALUE=DATE', function() {
  var date = from_line('DTSTART;VALUE=DATE:20111203');
  // js months start from 0
  assert.deepEqual(date, new Date(Date.UTC(2011, 11, 3)));
});

test('datetime zulu', function() {
  var date = from_line('DTSTART:20111109T190000Z');
  assert.deepEqual(date, new Date(Date.UTC(2011, 10, 9, 19, 0, 0)));
  assert.ok(!date.tz);
});

test('datetime with TZID', function() {
  var date = from_line('DTSTART;TZID=America/Phoenix:20111109T190000');
  assert.deepEqual(date, new Date(Date.UTC(2011, 10, 9, 19, 0, 0)));
  assert.equal(date.tz, 'America/Phoenix');
});
