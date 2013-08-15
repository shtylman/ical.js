var ical = module.exports = require('./ical');

var rrule = require('rrule').RRule;

ical.objectHandlers['RRULE'] = function(val, params, curr, par, line) {
  curr['rrule'] = rrule.fromString(line.replace('RRULE:', ''));
  return curr;
};
