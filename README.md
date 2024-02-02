# Setting up Homebridge on Pi

## Installing Homebridge
* Follow the installation steps in [homebridge](https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Raspbian#installing-homebridge) or enter the below commands
* Add Homebridge Repository
```bash
curl -sSfL https://repo.homebridge.io/KEY.gpg | sudo gpg --dearmor | sudo tee /usr/share/keyrings/homebridge.gpg  > /dev/null
echo "deb [signed-by=/usr/share/keyrings/homebridge.gpg] https://repo.homebridge.io stable main" | sudo tee /etc/apt/sources.list.d/homebridge.list > /dev/null
sudo apt-get update
sudo apt-get install homebridge
```

* Install Homebridge
```bash
sudo apt-get update
sudo apt-get install homebridge
```

* Homebridge installation completed: Login to the Homebridge UI
Login to the web interface by going to `http://<ip address of your server>:8581`.
To find the IP address of your server you can run:
```bash
hostname -I
```
Setup the homebridge by entering the username and password.


## Adding unpublished plugin to the Homebridge
* Navigate to homebridge terminal
```bash
sudo hb-shell
```

* Develop the plugin
As a Homebridge user, you can create a new plugin project in a folder (the folder name doesn't have to match the plugin name). For this project, you'll need to implement two main files: index.js and package.json.
-> index.js: This is where you write the main logic of your plugin. It should export a function that Homebridge will call to register your accessory or platform.
-> package.json: This file describes your plugin, including its name, version, and dependencies.
For more information check [homebridge-plugin-template](https://github.com/homebridge/homebridge-plugin-template) [homebridge-API](https://developers.homebridge.io/).

* Write the homebridge `config.json` file according to the plugin.
 ```bash
nano /var/lib/homebridge/config.json
```

* Navigate to your plugin folder (in my case it is homebridge-tcp-smarthome)
 ```bash
cd ~/github/homebridge-tcp-smarthome
```

* Install Development Dependencies
```bash
npm install
```

* Link to homebridge
```bash
npm link
```

* Link your plugin to the homebridge (replace `homebridge-tcp-smarthome` with your plugin name)
```bash
npm link homebridge-tcp-smarthome
```

* Restart the homebridge
```bash
systemctl restart homebridge
```
You will be asked to enter the homebridge password.

* Plugin successfully added.

To check your plugin in Homebridge, go to the Homebridge UI and navigate to the "Plugins" section. There, you can view and manage your installed plugins.


## Removing unpublished plugin from the Homebridge
* Run below commands in homebridge terminal to remove the plugin from homebridge. Replace `homebridge-tcp-smarthome` with your plugin name.
```bash
npm unlink homebridge-tcp-smarthome
rm -rf /opt/homebridge/lib/node_modules/homebridge-tcp-smarthome
```
* Restart the homebridge
```bash
systemctl restart homebridge
```
You will be asked to enter the homebridge password.


## Devloper Notes
* To see which plugins are linked to Homebridge, run the following command in the homebridge terminal.
```bash
ls /opt/homebridge/lib/node_modules
```

## Images
![Homebridge](img/homebridge.jpg)
