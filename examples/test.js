var key = '63a0e565521670b1cf32040bf179e2f904146e81',
resource = '3602159efda226c136854b0e381b00fd49533fe8',
swarm = '6c67d6493656d32698ec9f820feca33c38d9abf6',
messageCount = 10,
intervalId;

document.write('Attempting to connect to swarm...');
SWARM.connect({apikey: key,
               resource: resource,
               swarms: [swarm],
               //callbacks
               onconnect:
               function onConnect() {
                   document.write("Connected to swarm<br />");
                   sendMessages();
               },
               onmessage:
               function onMessage(message) {
                   document.write(JSON.stringify(message) + '<br />');
               },
               onerror:
               function onError(error) {
                   document.write(JSON.stringify(error) + '<br />');
               }
});

SWARM.addListener('message', function(message) {
  console.log('Console message listener: ',message);
});

var sendMessages = function() {
    intervalId = setInterval('sendMessage()', 1000);
};

var sendMessage = function() {
    SWARM.send('{"string": "hello world"}');
    document.writeln('Sent message<br />');
    messageCount--;
    if (messageCount <= 0) {
        clearInterval(intervalId);
        SWARM.disconnect();
        document.writeln('Disconnected from swarm<br />');
    }
};