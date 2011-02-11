//add after and before so that we can run the tests in a not nested way
//or evaluate nested specs meaning nested "it"s 

specify.main  = (function($, matchers){
  var my = {};
  var suites = 0;
  var specs = 0;
  var start = 0;

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
    
    fn(expect);
    specs++;

    //return spec.id;
  };

  return my;
})(jQuery, specify.matchers);

var describe = specify.main.describe;
var it = specify.main.it;

