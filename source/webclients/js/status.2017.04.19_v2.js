var id = Math.floor((Math.random() * 1000000) + 1);
var general_doorpi_online = false;
var general_sensorpi_online = false;
var general_door_state_1 = "unknown";
var general_door_state_2 = "unknown";
var general_sensor_ppm = "unknown";
var general_sensor_temp = "unknown";
var general_sensor_hum = "unknown";
var general_sensor_loud = "unknown";
var general_timestamp_door = "";
var general_timestamp_sensor = "";
var general_comment_door = "not connected";
var general_comment_sensor = "not connected";

//AWS -- START -------------------

var AWS = require('aws-sdk');
var AWSIoTData = require('aws-iot-device-sdk');
var AWSConfiguration = {
    poolId: 'eu-west-1:4681750c-2bd1-46b6-9fcf-6b6cb5a70cb2',
    region: 'eu-west-1'
};

AWS.config.region = AWSConfiguration.region;

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
   IdentityPoolId: AWSConfiguration.poolId
});

var shadowsRegistered = false;


const shadows = AWSIoTData.thingShadow({
   region: AWS.config.region,
   clientId: 'doorman-browser-' + (Math.floor((Math.random() * 100000) + 1)),
   protocol: 'wss',
   maximumReconnectTimeMs: 8000,
   debug: true,
   //
   // IMPORTANT: the AWS access key ID, secret key, and sesion token must be
   // initialized with empty strings.
   //
   accessKeyId: '',
   secretKey: '',
   sessionToken: ''
});

shadows.on('foreignStateChange', function(name, operation, stateObject) {
    if (name === 'DoorPi' && operation === 'update') {
        if (stateObject.state.reported != null){
            if (stateObject.state.reported.FemaleDoor != null){
                general_door_state_1 =  stateObject.state.reported.FemaleDoor;
            }
            if (stateObject.state.reported.MaleDoor != null){
                general_door_state_2 =  stateObject.state.reported.MaleDoor;
            }
            if (stateObject.timestamp != null){
                var d = new Date(stateObject.timestamp*1000);
                var datestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
                general_timestamp_door =  datestring;
            }
            if (stateObject.state.reported.connected != null){
              if (stateObject.state.reported.connected == "true"){
                general_doorpi_online = true;
              }
              else{
                general_doorpi_online = false;
                general_comment_door = "DoorPi is not connected";
              }
            }


        }
    }

    if (name === 'SensorPi' && operation === 'update') {
      if (stateObject.state.reported != null){
        if (stateObject.state.reported.temperature != null){
            general_sensor_temp =  stateObject.state.reported.temperature;
        }
        if (stateObject.state.reported.humidity != null){
            general_sensor_hum =  stateObject.state.reported.humidity;
        }
        if (stateObject.state.reported.co2 != null){
            general_sensor_ppm =  stateObject.state.reported.co2;
        }
        if (stateObject.timestamp != null){
            var d = new Date(stateObject.timestamp*1000);
            var datestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
            general_timestamp_sensor =  datestring;
        }
        if (stateObject.state.reported.connected != null){
          if (stateObject.state.reported.connected == "true"){
            general_sensorpi_online = true;
          }
          else{
            general_sensorpi_online = false;
            general_comment_sensor = "SensorPi is not connected";
          }
        }
      }
    }
    show_state();
})

//
// Update divs whenever we receive status events from the shadows.
//
shadows.on('status', function(name, statusType, clientToken, stateObject) {
  if (statusType === 'rejected') {
      //
      // If an operation is rejected it is likely due to a version conflict;
      // request the latest version so that we synchronize with the shadow
      // The most notable exception to this is if the thing shadow has not
      // yet been created or has been deleted.
      //
      if (stateObject.code !== 404) {
          console.log('resync with thing shadow');
          var opClientToken = shadows.get(name);
          if (opClientToken === null) {
              console.log('operation in progress');
          }
      }
 } else { // statusType === 'accepted'
    if (name === 'DoorPi' && stateObject.state.reported != null) {
      if (stateObject.state.reported.FemaleDoor != null){
        general_door_state_1 =  stateObject.state.reported.FemaleDoor;
      }
      if (stateObject.state.reported.MaleDoor != null){
        general_door_state_2 =  stateObject.state.reported.MaleDoor;
      }
      if (stateObject.state.reported.connected != null){
        if (stateObject.state.reported.connected == "true"){
          general_doorpi_online = true;
        }
        else{
          general_doorpi_online = false;
          general_comment_door = "DoorPi is not connected";
        }
      }
      if (stateObject.metadata != null){
          if (stateObject.metadata.reported != null) {
            var ts = null;
            if (stateObject.metadata.reported.FemaleDoor != null) {
              if (stateObject.metadata.reported.FemaleDoor.timestamp != null) {
                if (ts == null || ts < stateObject.metadata.reported.FemaleDoor.timestamp) {
                  ts = stateObject.metadata.reported.FemaleDoor.timestamp
                }
              }
            }
            if (stateObject.metadata.reported.connected != null) {
              if (stateObject.metadata.reported.connected.timestamp != null) {
                if (ts == null || ts < stateObject.metadata.reported.connected.timestamp) {
                  ts = stateObject.metadata.reported.connected.timestamp
                }
              }
            }
            if (ts != null){

              var d = new Date(ts*1000);
              var datestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
              general_timestamp_door =  datestring;
            }
          }
        }
      }
      if (name == 'SensorPi' && stateObject.state.reported != null){
        if (stateObject.state.reported.temperature != null){
            general_sensor_temp =  stateObject.state.reported.temperature;
        }
        if (stateObject.state.reported.humidity != null){
            general_sensor_hum =  stateObject.state.reported.humidity;
        }
        if (stateObject.state.reported.co2 != null){
            general_sensor_ppm =  stateObject.state.reported.co2;
        }
        if (stateObject.state.reported.connected != null){
          if (stateObject.state.reported.connected == "true"){
            general_sensorpi_online = true;
          }
          else{
            general_sensorpi_online = false;
            general_comment_sensor = "SensorPi is not connected";
          }
        }
        if (stateObject.metadata != null){
            if (stateObject.metadata.reported != null) {
              var ts = null;
              if (stateObject.metadata.reported.temperature != null) {
                if (stateObject.metadata.reported.temperature.timestamp != null) {
                  if (ts == null || ts < stateObject.metadata.reported.temperature.timestamp) {
                    ts = stateObject.metadata.reported.temperature.timestamp
                  }
                }
              }
              if (stateObject.metadata.reported.connected != null) {
                if (stateObject.metadata.reported.connected.timestamp != null) {
                  if (ts == null || ts < stateObject.metadata.reported.connected.timestamp) {
                    ts = stateObject.metadata.reported.connected.timestamp
                  }
                }
              }
              if (ts != null){

                var d = new Date(ts*1000);
                var datestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
                general_timestamp_sensor =  datestring;
              }
            }
          }
      }
      show_state();
   }
});

//
// Attempt to authenticate to the Cognito Identity Pool.  Note that this
// example only supports use of a pool which allows unauthenticated
// identities.
//
var cognitoIdentity = new AWS.CognitoIdentity();
//AWS.config.credentials.clearCachedId();
AWS.config.credentials.get(function(err, data) {
   if (!err) {
      console.log('retrieved identity: ' + AWS.config.credentials.identityId);
      var params = {
         IdentityId: AWS.config.credentials.identityId
      };
      cognitoIdentity.getCredentialsForIdentity(params, function(err, data) {
         if (!err) {
            //
            // Update our latest AWS credentials; the MQTT client will use these
            // during its next reconnect attempt.
            //
            shadows.updateWebSocketCredentials(data.Credentials.AccessKeyId,
               data.Credentials.SecretKey,
               data.Credentials.SessionToken);
         } else {
            console.log('error retrieving credentials: ' + err);
            alert('error retrieving credentials: ' + err);
         }
      });
   } else {
      console.log('error retrieving identity:' + err);
      alert('error retrieving identity: ' + err);
   }
});

//
// Connect handler; update div visibility and fetch latest shadow documents.
// Register shadows on the first connect event.
//
window.shadowConnectHandler = function() {
    console.log('connect');

   //
   // We only register our shadows once.
   //
   if (!shadowsRegistered) {
      shadows.register('DoorPi', {
         persistentSubscribe: true
      });
       shadows.register('SensorPi', {
           persistentSubscribe: true
       });
      shadowsRegistered = true;
   }
   //
   // After connecting, wait for a few seconds and then ask for the
   // current state of the shadows.
   //
   setTimeout(function() {
      var opClientToken = shadows.get('DoorPi');
      if (opClientToken === null) {
         console.log('operation in progress');
      }
   }, 3000);

    setTimeout(function() {
        var opClientToken = shadows.get('SensorPi');
        if (opClientToken === null) {
            console.log('operation in progress');
        }
    }, 3000);
};

//
// Reconnect handler; update div visibility.
//
window.shadowReconnectHandler = function() {
    console.log('reconnect');
};

//
// Install connect/reconnect event handlers.
//
shadows.on('connect', window.shadowConnectHandler);
shadows.on('reconnect', window.shadowReconnectHandler);

//AWS -- END ---------------------


function onConnect() {
  console.log("onConnect");
}

function set_disconnected_state(){
  set_unknown_state_door();
  set_unknown_state_sensor();
}

function set_unknown_state_door(){
  document.getElementById("circle1").style.backgroundColor = 'black';
  document.getElementById("circle2").style.backgroundColor = 'black';
  document.getElementById("timestampIdDoor").innerHTML = general_comment_door;
  var red = document.getElementById('redStatus');
  var yellow = document.getElementById('yellowStatus');
  var green = document.getElementById('greenStatus');
  red.style.display = 'none';
  yellow.style.display = 'none';
  green.style.display = 'none';
}

function set_unknown_state_sensor(){
  document.getElementById("sensorTemp").innerHTML = '?';
  document.getElementById("sensorHum").innerHTML = '?';
  document.getElementById("timestampIdEnv").innerHTML = general_comment_sensor;
  $('.js-gauge--co2').hide();
}

function onConnectionLost() {
  set_disconnected_state();
}

function onMessageArrived(topic, message_raw, packet) {
  console.log("onMessageArrived:"+message_raw);
  var message = eval('(' + message_raw + ')');

  if(topic == subscribe_topic_name_sensorpi_connection){
    if(message.connected != undefined){
      general_sensorpi_online = true;
    }else if (message.disconnected != undefined) {
      general_sensorpi_online = false;
      general_comment_sensor = "SensorPi is not connected";
    }
  }else{
    if(topic == subscribe_topic_name_sensorpi)
    {
      if( message.state != undefined){
        general_sensor_ppm = message.state.co2;
        general_sensor_temp = message.state.temperature;
        general_sensor_hum = message.state.humidity;
        general_timestamp_sensor =  message.state.timestamp;
      }
    }
  }
  show_state();
}

function show_state(){
  if(general_doorpi_online){
    set_doors_state(general_door_state_1, general_door_state_2, general_timestamp_door);
    set_general_state(general_door_state_1, general_door_state_2);
  }else{
    set_unknown_state_door();
  }

  if(general_sensorpi_online){
    set_sensor_state(general_sensor_ppm, general_sensor_temp, general_sensor_hum, general_sensor_loud, general_timestamp_sensor)
  }else{
    set_unknown_state_sensor();
  }
}

function set_general_state(door1, door2){
  var red = document.getElementById('redStatus');
  var yellow = document.getElementById('yellowStatus');
  var green = document.getElementById('greenStatus');
  red.style.display = 'none'
  yellow.style.display = 'none'
  green.style.display = 'none'
  if(door1 == "open" && door2 == "open"){
    green.style.display = 'block'
  }else{
    if(door1 == "open" || door2 == "open"){
      yellow.style.display = 'block'
    }else{
      red.style.display = 'block'
    }
  }
}


function set_doors_state(door1_state, door2_state, timestamp) {
    document.getElementById("timestampIdDoor").innerHTML = timestamp;
    var div1 = document.getElementById('circle1');
    var div2 = document.getElementById('circle2');

    if(door1_state == "open") {
      div1.style.backgroundColor = 'green';
    }else{
      div1.style.backgroundColor = 'red';
    }

    if(door2_state == "open") {
      div2.style.backgroundColor = 'green';
    }else{
      div2.style.backgroundColor = 'red';
    }
}

function set_sensor_state(ppm, temp, hum, loud, timestamp) {
  if( !$('.js-gauge--co2').is(':visible') ) {
    $('.js-gauge--co2').kumaGauge({
      value : 0,
      max: 1200,
      min: 400,
      label: {
        display : true,
        fontFamily : 'Arial',
        fontColor : '#000',
        fontSize : '12',
        fontWeight : 'normal',
        left: 'Healthy',
        right: 'Dangerous'
      }
    });
    $('.js-gauge--co2').show();
  }

  var newGaugeVal = parseInt(ppm);
  if( !isNaN(newGaugeVal) ) {
    $('.js-gauge--co2').kumaGauge('update', {
      value : newGaugeVal,
      label : {
        display : true,
        fontFamily : 'Arial',
        fontColor : '#000',
        fontSize : '12',
        fontWeight : 'normal',
        left: 'Healthy',
        right: 'Dangerous'
      }
    });
  }

  document.getElementById("sensorTemp").innerHTML = temp;
  document.getElementById("sensorHum").innerHTML = hum;
  document.getElementById("timestampIdEnv").innerHTML = timestamp;


}

function run_main(){
  set_disconnected_state();

}
