var fs = require('fs');
var assert = require('assert')

var ical = require('../')
var parseFile = require('./lib/parse_file');

test('todo', function() {
  var calendar = parseFile('todo.ics');

  var topic = calendar.VTODO.shift();
  assert.equal(topic.UID, 'uid4@host1.com');
  assert.equal(topic.DUE, '19980415T235959');
});

