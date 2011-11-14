if (!Function.prototype.bind) {
    /**
     * Makes sure .bind exists (ES5)
     * @return {Object} blah.
     * @param {Object} oThis blah.
     **/
    Function.prototype.bind = function(oThis) {
        //closest thing possible to the ECMAScript 5
        //internal IsCallable function
        if (typeof this !== 'function') {
            throw new TypeError('Function.prototype.bind ' +
            '- what is trying to be fBound is not callable');
        }
        var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function() {},
        fBound = function() {
            return fToBind.apply(
            this instanceof fNOP ? this : oThis || window,
            aArgs.concat(Array.prototype.slice.call(arguments)));
        };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

if (!Array.isArray) {
    /**
     * Makes sure Array.isArray exists. (ES5)
     **/
    Array.isArray = (function() {
        // save a reference built-in Object.prototype.toString
        var builtInToString = Object.prototype.toString;

        // save a reference to built-in Function.prototype.call
        var builtInToCall = Function.prototype.call;

        // requires a built-in bind function, not a shim
        var callWithArgs = builtInToCall.bind(builtInToCall);

        var argToString = function(o) {
            return callWithArgs(builtInToString, o);
        };

        return function(o) {
            return argToString(o) === '[object Array]';
        };
    })();
}

