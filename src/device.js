var Device = BugSwarm.Device = function(bugswarm) {
  /**
  * Object used to return functions that will be
  * public
  * 
  * Module Pattern
  * @see http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth 
  * 
  * @api private
  */

  var my = {};
  

  my.services = function() {};

  my.modules = function() {};

  my.models = function() {};

  return my;
};
