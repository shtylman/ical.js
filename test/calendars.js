var fs = require('fs');
var assert = require('assert')

var ical = require('../')
var parseFile = require('./lib/parse_file');

test('basic.ics', function() {
  var calendar = parseFile('basic.ics');
  assert.equal(calendar.VERSION, '2.0');
});

test('single event', function() {
  var calendar = parseFile('single-event.ics');

  assert.equal(calendar.VEVENT.length, 1);

  var event = calendar.VEVENT.shift();
  assert.equal(event.UID, 'uid1@example.com');
  assert.equal(event.SUMMARY, 'Bastille Day Party');
});
