/****************
 *  A tolerant, minimal icalendar parser
 *  (http://tools.ietf.org/html/rfc5545)
 *
 *  <peterbraden@peterbraden.co.uk>
 * **************/


// Unescape Text re RFC 4.3.11
var text = function(t){
  return (t
    .replace(/\\\,/g, ',')
    .replace(/\\\;/g, ';')
    .replace(/\\[nN]/g, '\n')
    .replace(/\\\\/g, '\\')
  )
}

var parseParams = function(p){
  var out = {}
  for (var i = 0; i<p.length; i++){
    if (p[i].indexOf('=') < 0) {
      continue;
    }
    var segs = p[i].split('=')
    var out = {}
    if (segs.length == 2){
      out[segs[0]] = segs[1]
    }
  }
  return out || sp
}

var storeParam = function(name){
  return function(params, val, ctx){
    if (params && params.length && !(params.length==1 && params[0]==='CHARSET=utf-8')) {
      ctx[name] = { params:params, val:text(val) }
    }
    else {
      ctx[name] = text(val)
    }

    return ctx
  }
}

var parse_datetime = module.exports.datetime = function(params, val) {

    // Just Date
    if (params && params.VALUE === 'DATE') {
      var comps = /^(\d{4})(\d{2})(\d{2})$/.exec(val);
      if (comps !== null) {

        var date = {
          year: comps[1] - 0,
          month: comps[2] - 0,
          day: comps[3] - 0,
          hour: 0,
          minute: 0,
          second: 0
        };

        if (params.TZID) {
          date.tz = params.TZID
        }

        return date;
      }
    }

    //typical RFC date-time format
    var comps = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(val);
    if (comps === null) {
      return undefined;
    }

    var date = {
      year: comps[1] - 0,
      month: comps[2] - 0,
      day: comps[3] - 0,
      hour: comps[4] - 0,
      minute: comps[5] - 0,
      second: comps[6] - 0
    };

    if (params && params.TZID) {
      date.tz = params.TZID;
    }

    return date;
}

var dateParam = function(name){
  return function(params, val, ctx){
    // Store as string - worst case scenario
    storeParam(name)(undefined, val, ctx)

    var date = parse_datetime(params, val);
    if (date) {
      ctx[name] = date;
    }

    return ctx;
  }
}

// split a line into, name, params, value
// this is run on every line
module.exports.parse_line = function(str) {
    var kv = str.split(":")

    // Invalid line - must have k&v
    if (kv.length < 2){
      return null;
    }

    // Although the spec says that vals with colons should be quote wrapped
    // in practise nobody does, so we assume further colons are part of the val
    var value = kv.slice(1).join(":")
    var kp = kv[0].split(";")
    var params = parseParams(kp.slice(1));

    return { name: kp[0], params: params, value: value };
};

module.exports.objectHandlers = {
  BEGIN: function(params, value, ctx, calendar, line) {
    if (value === 'VCALENDAR') {
      return calendar;
    }

    var topic = {};
    var arr = calendar[value] = calendar[value] || [];
    arr.push(topic);

    return topic;
  },
  END: function(params, value, ctx, calendar) {
    return calendar;
  },
  DTSTART: dateParam('DTSTART'),
  DTEND: dateParam('DTEND'),
  COMPLETED: dateParam('COMPLETED')
}

exports.handleObject = function(name, params, value, ctx, calendar, line){
  var handler = exports.objectHandlers[name];
  if (handler) {
    return handler(params, value, ctx, calendar, line);
  }

  return storeParam(name)(params, value, ctx);
}

exports.parseICS = function(str) {
  var lines = str.split(/\r?\n/)

  var parse_line = module.exports.parse_line;

  var calendar = {};
  // context starts out as calendar
  var ctx = calendar;

  for (var i = 0, ii = lines.length, l = lines[0]; i<ii; i++, l=lines[i]){
    //Unfold : RFC#3.1
    while (lines[i+1] && /[ \t]/.test(lines[i+1][0])) {
      l += lines[i+1].slice(1)
      i += 1
    }

    var obj = parse_line(l);
    if (!obj) {
      continue;
    }

    ctx = exports.handleObject(obj.name, obj.params, obj.value, ctx, calendar, l) || {}
  }

  return calendar
}
