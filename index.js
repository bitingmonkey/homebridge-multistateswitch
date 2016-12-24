// MQTT Switch Accessory plugin for HomeBridge
//
// Remember to add accessory to config.json. Example:
// "accessories": [
//     {
//            "accessory": "mqttswitch",
//            "name": "PUT THE NAME OF YOUR SWITCH HERE",
//            "url": "PUT URL OF THE BROKER HERE",
//			  "username": "PUT USERNAME OF THE BROKER HERE",
//            "password": "PUT PASSWORD OF THE BROKER HERE"
// 			  "caption": "PUT THE LABEL OF YOUR SWITCH HERE",
// 			  "topics": {
// 				"statusGet": 	"PUT THE MQTT TOPIC FOR THE GETTING THE STATUS OF YOUR SWITCH HERE",
// 				"statusSet": 	"PUT THE MQTT TOPIC FOR THE SETTING THE STATUS OF YOUR SWITCH HERE"
// 			  },
//			  "onValue": "OPTIONALLY PUT THE VALUE THAT MEANS ON HERE (DEFAULT true)",
//			  "offValue": "OPTIONALLY PUT THE VALUE THAT MEANS OFF HERE (DEFAULT false)",
//			  "integerValue": "OPTIONALLY SET THIS TRUE TO USE 1/0 AS VALUES",
//     }
// ],
//
// When you attempt to add a device, it will ask for a "PIN code".
// The default code for all HomeBridge accessories is 031-45-154.

'use strict';

var Service, Characteristic;

var maxStatus = 1

function MultiStateSwitch(log, config) {
  	this.log          	= log;
  	this.name 			= config["name"];
	this.caption		= config["caption"];
    
    this.switchStatus = Array(maxStatus);
    this.service = Array(maxStatus);

    for (var i=0; i<maxStatus; i++) {
    	this.switchStatus[i] = false;

    	this.service[i] = new Service.StatefulProgrammableSwitch(this.name);
      	this.service[i]
        	.getCharacteristic(Characteristic.ProgrammableSwitchOutputState)
        	.on('get', this.getStatus.bind(this))
        	.on('set', this.setStatus.bind(this));

    }
    // // connect to MQTT broker
    // this.client = mqtt.connect(this.url, this.options);
    // var that = this;
    // this.client.on('error', function () {
    //     that.log('Error event on MQTT');
    // });
    //
    // this.client.on('message', function (topic, message) {
    //     if (topic == that.topicStatusGet) {
    //         var status = message.toString();
    //         that.switchStatus = (status == that.onValue) ? true : false;
    //            that.service.getCharacteristic(Characteristic.On).setValue(that.switchStatus, undefined, 'fromSetValue');
    //     }
    // });
    //     this.client.subscribe(this.topicStatusGet);
}

module.exports = function(homebridge) {
  	Service = homebridge.hap.Service;
  	Characteristic = homebridge.hap.Characteristic;

  	homebridge.registerAccessory("homebridge-multistateswitch", "multistateswitch", MultiStateSwitch);
}

MultiStateSwitch.prototype.getStatus = function(callback) {
    callback(null, this.switchStatus);
}

MultiStateSwitch.prototype.setStatus = function(status, callback, context) {
	if(context !== 'fromSetValue') {
		this.switchStatus = status;
	    this.client.publish(this.topicStatusSet, status ? this.onValue : this.offValue, this.publish_options);
	}
	callback();
}

MultiStateSwitch.prototype.getServices = function() {
  return [this.service];
}