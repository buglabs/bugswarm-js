This is the javascript library to connect to BUGswarm. It's base on [socket.io](http://socket.io) and supports a wide
variety of [browsers](http://socket.io/#browser-support)

The library is distributed by our [CDN](http://en.wikipedia.org/wiki/Content_delivery_network) and 
we really encourage you to use this version instead of linking it locally in your own application.

## Link the library in your web application

```html
<html>
    <head>
        <script src="http://cdn.buglabs.net/swarm/swarm-v0.3.0.js"></script>
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

            function onError(error) {
                console.log('error! -> ' + JSON.stringify(error));
            }

            SWARM.debug = true;

            var timer;

            SWARM.connect({ apikey: 'PUT YOUR PARTICIPATION APIKEY HERE',
                            resource: 'PUT YOUR RESOURCE ID',
                            swarms: ['PUT YOUR SWARMHERE'],
                            onmessage: onMessage, 
                            onpresence: onPresence, 
                            onerror: onError, 
                            onconnect: onConnect});
        </script>
    </body>
</html>
```

### Generate distributable version.
```shell
make dist
```

### TODO 
- examples


