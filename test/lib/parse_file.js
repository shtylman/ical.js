var fs = require('fs');
var ical = require('../../');

module.exports = function(file) {
  var content = fs.readFileSync(__dirname + '/../fixtures/' + file, 'utf8');
  return ical.parseICS(content);
};
