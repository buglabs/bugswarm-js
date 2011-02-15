specify.main  = (function($, matchers){
  var my = {};
  var suites = 0;
  var specs = 0;
  var start = 0;
  var queue = [];

  var currentSuite = -1;

  my.describe = function(description, fn) {
    var suite = { description: description,
                  body: fn.toString(),
                  id: 'suite_' + suites 
                };
    
    $(window).trigger('newSuite', suite);
    currentSuite = suite.id;
    start = start || new Date().getTime();

    fn();
    suites++;
  };

  my.it = function(description, fn) {
    var fnstr = fn.toString();
    var normalized = fnstr.replace(/\s/g, "");
    var pending = normalized == 'function(){}';

    var spec = { description: description, 
                 body: fnstr,
                 id: 'spec_' + specs,
                 pending: pending,
                 suiteId: currentSuite,
                 start: start
                };
    $(window).trigger('newSpec', spec);
    
    var expect = matchers.expect;
    expect = expect.bind(spec);

    var obj = {fn: fn, matcher: expect};
    queue.push(obj);
    specs++;

    //return spec.id;
  };

  my.before = function(fn) {
    queue.push(fn);
  };

  my.after = function(fn) {
    queue.push(fn);
  };

  my.next = function() {
    if(queue.length) {
      var spec = queue.shift();
      if(typeof spec == 'object') {
        spec.fn(spec.matcher);
      } else if(typeof spec == 'function') {
        spec();
      }
    }
  };

  my.start = function() {
    next();
  };

  return my;
})(jQuery, specify.matchers);

var describe = specify.main.describe;
var it = specify.main.it;
var next = specify.main.next;
var after = specify.main.after;
var before = specify.main.before;

