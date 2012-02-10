var key = 'eb9ea4425c743e54bee4b8776c0adb50f35d6b33',
resource = '67c27468ca5a1f86db83c2fddbb85ea18b4ce82d',
swarm = 'c6cd016dbbff859c0a4e59b2efbe04874918d3b8',
messageCount = 100,
intervalId;

document.write('Attempting to connect to swarm...');
SWARM.connect({apikey: key,
               resource: resource,
               swarms: [swarm],
               
               //callbacks
               onconnect:
               function onConnect() {
                   document.writeln("Connected to swarm");
                   sendMessages();
               },

               onmessage:
               function onMessage(message) {
                   document.writeln(message);
               },

               onerror:
               function onError(error) {
                   document.writeln(JSON.stringify(error));
               }
});

var sendMessages = function() {
    intervalId = setInterval('sendMessage()', 1000);
};

var sendMessage = function() {
    SWARM.send('{"string": "hello world"}');
    document.writeln('Sent message');
    messageCount--;
    if (messageCount <= 0) {
        clearInterval(intervalId);
    }
};