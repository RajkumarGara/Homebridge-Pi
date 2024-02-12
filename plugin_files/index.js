'use strict';

const tcp = require('./tcp');

module.exports = (api) => {
    api.registerPlatform('TCPSmartHome', TcpSmarthomePlatform);
};

class TcpSmarthomePlatform {
    constructor(log, config, api) {
        this.log = log;
        this.api = api;
        this.devices = config.devices || [];
        this.accessories = [];
        this.ip = config.ip_address;
        // this.port = config.port;
        log.warn('t1. TcpSmarthomePlatform IP:', this.ip);

        api.on('didFinishLaunching', () => {
            this.devices.forEach(device => this.setupDevice(device));
        });
    }

    setupDevice(device) {
        const uuid = this.api.hap.uuid.generate(device.id); // Use device ID to ensure uniqueness
        let existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

        if (!existingAccessory) {
            let accessory = new this.api.platformAccessory(device.name, uuid);
            accessory.context.device = device; // Store device info in accessory.context for easy access

            // Setup accessory based on its type
            if (device.type.toLowerCase() === 'light') {
                this.log.warn('t11. device.type light');
                this.setupLightAccessory(accessory, device, this.ip, device.port);
            } else if (device.type.toLowerCase() === 'blind') {
                this.log.warn('t12. device.type blind');
                this.setupBlindAccessory(accessory, device, this.ip, device.port);
            }

            this.api.publishExternalAccessories('homebridge-tcp-smarthome', [accessory]);
            this.accessories.push(accessory);
        }
    }

    // Method to load cached accessories
    configureAccessory(accessory) {
        this.accessories.push(accessory);
    }

    setupLightAccessory(accessory, device, ip, port) {
        let service = accessory.addService(this.api.hap.Service.Lightbulb, device.name);
        // Initialize variables to manage state and debounce
        let lastCommandTime = 0;
        const COMMAND_DEBOUNCE_MS = 500; // 500ms debounce to prevent multiple commands
    
        function shouldSendCommand() {
            const now = Date.now();
            if (now - lastCommandTime > COMMAND_DEBOUNCE_MS) {
                lastCommandTime = now;
                return true;
            }
            return false;
        }
    
        service.getCharacteristic(this.api.hap.Characteristic.On)
            .on('set', (value, callback) => {
                this.log.warn('t21. light on/off');
                if (value) {
                    // Before turning on, check if it's safe to send the command (debounce)
                    if (shouldSendCommand()) {
                        // Update the Brightness characteristic to 100% in HomeKit only if needed
                        const currentBrightness = service.getCharacteristic(this.api.hap.Characteristic.Brightness).value;
                        if (currentBrightness !== 100) {
                            service.getCharacteristic(this.api.hap.Characteristic.Brightness).updateValue(100);
                        }
                        tcp.sendCommand(ip, port, `LOAD ${device.id} 100\r`);
                    }
                } else {
                    // Always allow turning off
                    tcp.sendCommand(ip, port, `LOAD ${device.id} 0\r`);
                }
                callback();
            });
    
        service.getCharacteristic(this.api.hap.Characteristic.Brightness)
            .on('set', (value, callback) => {
                this.log.warn('t22. light brightness');
                if (shouldSendCommand()) {
                    tcp.sendCommand(ip, port, `LOAD ${device.id} ${value}\r`);
                }
                callback();
            });
    }
                
    setupBlindAccessory(accessory, device, ip, port) {
        let service = accessory.addService(this.api.hap.Service.WindowCovering, device.name);
    
        // Set the initial position state to stopped
        service.setCharacteristic(this.api.hap.Characteristic.PositionState, this.api.hap.Characteristic.PositionState.STOPPED);
    
        // The TargetPosition characteristic is used to move the blinds to a desired position
        service.getCharacteristic(this.api.hap.Characteristic.TargetPosition)
            .on('set', (value, callback) => {
                this.log.warn('t31. Blinds - Set Position');
                // Mapping from percentage levels to custom levels
                const levelMap = {
                    0: 'DN', 
                    25: 'G3',
                    50: 'G2',
                    75: 'G1',
                    100: 'UP'
                };

                // Convert the 0-100% range into one of your 5 preset levels
                let normalizedValue = Math.round(value / 25) * 25; // This will normalize to 0%, 25%, 50%, 75%, 100%
                let level = levelMap[normalizedValue]; // Use the map to get the corresponding level
                tcp.sendCommand(ip, port, `#0.0.0.A=${level}\r`);
                callback();
    
                // Update the CurrentPosition characteristic to match the TargetPosition
                service.setCharacteristic(this.api.hap.Characteristic.CurrentPosition, value);

                // Set the position state to stopped after a delay, to simulate motion
                setTimeout(() => {
                    service.setCharacteristic(this.api.hap.Characteristic.PositionState, this.api.hap.Characteristic.PositionState.STOPPED);
                }, 1000); // Adjust this 1sec delay as necessary
            });
    }
}
