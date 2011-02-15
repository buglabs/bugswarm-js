var specify = {};
specify.matchers = (function($) {
  var my = {};
  var actual;
  var spec;

  function triggerReport(data) {
    data.actual = actual;
    data.spec = spec;
    data.duration = new Date().getTime() - spec.start;

    $(window).trigger('matcher', data);
  }

  my.expect = function(current) {
    spec = this;
    actual = current; 

    $(window).trigger('newMatcher');
    return my;
  };

  my.be = function(expected) {
    return my;
  };

  my.equals = function(expected) {
    var matcher = { expected: expected };
    matcher.passed = actual === expected;
    triggerReport(matcher);
  };

  my.toHaveProperty = function(expected) {
    var matcher = { expected: expected };
    var passed = false;

    if(actual.hasOwnProperty(expected)) {
      passed = true;
    }  
    matcher.passed = passed;
    triggerReport(matcher);
  };

  my.true = function() {
    var passed = actual === true;
    var matcher = {};
    matcher.passed = passed;
    matcher.expected = true;

    triggerReport(matcher);
  };

  return my;
})(jQuery);
