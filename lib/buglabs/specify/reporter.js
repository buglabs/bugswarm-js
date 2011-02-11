specify.reporter = (function($){
  var my = {};
  var matchers = 0;

  function suiteHtml(id, description) {
    return  "<tr id='"+id+"' class='description'>" +
              "<td colspan='2'>" +
                description + 
              "</td>" + 
            "</tr>";
  }

  function specHtml(spec) {
    var id = spec.id;
    var desc = spec.description;
    var body = spec.body;
    var status = spec.pending ? 'requires-implementation' : 'pass';

    return "<tr id='" + id +"' class='" + (id % 2 ? 'odd': 'even') + "'>" +
              "<td class='"+ status +"'>" + desc + "</td>" +
              "<td id='matchers_"+id+"'></td>" +
              "<tr class='body'>" + 
                "<td colspan='2'>" + 
                  "<pre>" + body + "</pre>" + 
                "</td>" +
              "</tr>" +
            "</tr>";
  }

  function matcherHtml(passed) {
    return "<span class='spec "+ (passed ? 'passed' : 'failed') + "'></span>";
  }

  function appendMatcher(matcher) {
    var passed = matcher.passed;
    var specId = matcher.spec.id;

    //tagging spec as failed 
    if(!matcher.passed) {
      var field = $('#' + specId).find('td:first');
      if(!field.find('em').length) {
        var msg = 'expected ' + matcher.expected + ' and got ' + matcher.actual;
        var text = field.text() +  "<em>" + msg + "</em>";
        field.html(text);
      }

      //update total failures
      var failures = $('#failures').find('em').text();
      failures = parseInt(failures);
      failures++;
      $('#failures').find('em').text(failures);
      
      //tag the spec as failed    
      field.removeClass('pass').addClass('fail');
  
    } else {
      //update total passes
      var passes = $('#passes').find('em').text();
      passes = parseInt(passes);
      passes++;
      $('#passes').find('em').text(passes);
    }
    
    //hide loading icon
    console.log('hide loading icon');
    
    //graph
    var html = matcherHtml(passed);
    $('#matchers_'+specId).append(html);

    //test duration
    $('#duration').find('em').text(matcher.duration);
  }

  $(window).bind('matcher', function(e, data) {
    appendMatcher(data);
  });


  $(window).bind('newMatcher', function() {
    matchers += 1;
    console.log('show loading icon');
    $('#total').find('em').text(matchers);
  });

  $(window).bind('newSuite', function(e, suite) {
    var html = suiteHtml(suite.id, suite.description);
    $('.suites').append(html);
  });

  $(window).bind('newSpec', function(e, spec) {
    var html = specHtml(spec);
    $('#' + spec.suiteId).after(html);
  });

  return my;
})(jQuery);

