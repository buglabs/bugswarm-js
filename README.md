# BUGswarm Javascript Library

Connect your resources to BUGswarm and share their information with any web browser through our 
Javascript library. It is based on [socket.io](http://socket.io) and supports a wide
variety of [browsers](http://socket.io/#browser-support).

The library is distributed by our [CDN](http://en.wikipedia.org/wiki/Content_delivery_network) and 
we really encourage you to use this version instead of linking it locally in your own application.

### Link the library in your web application

```html
<html>
    <head>
        <script type="text/javascript" src="http://cdn.buglabs.net/swarm/swarm-v0.3.2.min.js"></script>
    </head>
    <body>
        <script>
            /* Open this file twice or more with your browser and you should be able 
                to see your own presence messages in the developer 
                console of your browser. */
            function onPresence(presence) {
                console.log('presence -> ' + Date.now() + ':' + presence);
            }
        
            function onMessage(message) {
                console.log('message -> ' + Date.now() + ': ' + message);
            }

            //let's use information from our 'demo' account
            SWARM.connect({ apikey: '3e98ac6ca152f9bc279d0ef6e6bc9877e1508fd8', //participation key
                            resource: '0da7ce672f5a2e067ee8a0e050ca3e363283ea39', //your resource id that also is a member of your swarm
                            swarms: ['db07c1f9ff0628e33378cf39dc16df0755cdd3f0'], //your swarm
                            onmessage: onMessage, //your message function callback
                            onpresence: onPresence}); //our presence function callback
        </script>
    </body>
</html>
```

### Fork it, improve it and send us pull requests.
```shell
git clone git@github.com:buglabs/bugswarm-api.git && cd bugswarm-api/javascript
```

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


