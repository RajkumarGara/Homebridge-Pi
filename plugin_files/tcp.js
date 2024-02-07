var net = require('net');

function sendCommand(ip, port, command) {
    // Create a new TCP client
    var client = new net.Socket();

    // Connect to the device
    client.connect(port, ip, () => {
        console.log('TCP Connection established to: ' + ip + ':' + port);
        // Send the command and close the connection in the callback
        client.write(command, () => {
            console.log('TCP command sent: ', command);
            client.end(); // Close the connection gracefully after sending the command
        });
    });

    // Handle data from the device
    client.on('data', (data) => {
        console.log('TCP Received data:', data.toString());
        client.destroy(); // kill client after server's response
    });

    // Handle TCP client errors
    client.on('error', (err) => {
        console.log('TCP Connection Error:', err);
        client.destroy();
    });

    // Close the connection when done
    client.on('close', () => {
        console.log('TCP Connection closed');
    });
}

module.exports = {
    sendCommand
};
