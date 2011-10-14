This is the javascript library to connect to BUGswarm. It's based on [socket.io](http://socket.io) and supports a wide
variety of [browsers](http://socket.io/#browser-support)

The library is distributed by our [CDN](http://en.wikipedia.org/wiki/Content_delivery_network) and 
we really encourage you to use our CDN instead of linking it locally in your own application.

### Link the library in your web application

```html
<html>
    <head>
        <script type="text/javascript" src="http://cdn.buglabs.net/swarm/swarm-v0.3.0.js"></script>
    </head>
    <body>
        <script>
            /* Open this file twice or more and you should be able 
                to see your own presence messages in the developer 
                console of your browser. */
            function onPresence(presence) {
                console.log('presence -> ' + Date.now() + ':' + presence);
            }
        
            function onMessage(message) {
                console.log('message -> ' + Date.now() + ': ' + message);
            }

            SWARM.connect({ apikey: 'PUT YOUR PARTICIPATION APIKEY HERE',
                            resource: 'PUT YOUR RESOURCE ID',
                            swarms: ['PUT YOUR SWARMHERE'],
                            onmessage: onMessage, 
                            onpresence: onPresence});
        </script>
    </body>
</html>
```

### You can clone the library and improve the library and send us pull requests
```
```

### Generate distributable version.
```shell
make dist
```

### TODO 
- examples

## License
(The MIT License)

Copyright 2011 BugLabs. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.


