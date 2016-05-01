var id = Math.floor((Math.random() * 1000000) + 1);
var client_name = "web_client_index_" + id;
var subscribe_topic_name_doorpi = "/World/Fog/1/DoorPi/Event";
var subscribe_topic_name_sensorpi = "/World/Fog/1/SensorPi/Event";
var subscribe_topic_name_doorpi_connection = "/World/Fog/1/DoorPi/Connection";
var subscribe_topic_name_sensorpi_connection = "/World/Fog/1/SensorPi/Connection";
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

function onConnect() {
  console.log("onConnect");
  client.subscribe(subscribe_topic_name_doorpi);
  client.subscribe(subscribe_topic_name_doorpi_connection);
  client.subscribe(subscribe_topic_name_sensorpi);
  client.subscribe(subscribe_topic_name_sensorpi_connection);

  document.getElementById("brokerSection").style.display = 'none';
  document.getElementById("usernameSection").style.display = 'none';
  document.getElementById("passwordSection").style.display = 'none';
  document.getElementById("connectButton").style.display = 'none';
  document.getElementById("disconnectButton").style.display = 'block';
}

function set_disconnected_state(){
  document.getElementById("brokerSection").style.display = 'block';
  document.getElementById("usernameSection").style.display = 'block';
  document.getElementById("passwordSection").style.display = 'block';
  document.getElementById("connectButton").style.display = 'block';
  document.getElementById("disconnectButton").style.display = 'none';
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
  document.getElementById("sensorPpm").innerHTML = '?';
  document.getElementById("sensorTemp").innerHTML = '?';
  document.getElementById("sensorHum").innerHTML = '?';
  //document.getElementById("sensorLoud").innerHTML = '?';
  document.getElementById("timestampIdEnv").innerHTML = general_comment_sensor;
}

function onConnectionLost() {
  set_disconnected_state();
}

function onMessageArrived(topic, message_raw, packet) {
  console.log("onMessageArrived:"+message_raw);
  var message = eval('(' + message_raw + ')');
  if(topic == subscribe_topic_name_doorpi)
  {
    if( message.state != undefined){
      general_door_state_1 =  message.state.door1;
      general_door_state_2 =  message.state.door2;
      general_timestamp_door =  message.state.timestamp;
    }
  }else{
    if(topic == subscribe_topic_name_doorpi_connection){
      if(message.connected != undefined){
        general_doorpi_online = true;
      }else if (message.disconnected != undefined) {
        general_doorpi_online = false;
        general_comment_door = "DoorPi is not connected";
      }
    }else{
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
            general_sensor_loud = message.state.loudness;
            general_timestamp_sensor =  message.state.timestamp;
          }
        }
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
  document.getElementById("sensorPpm").innerHTML = ppm;
  document.getElementById("sensorTemp").innerHTML = temp;
  document.getElementById("sensorHum").innerHTML = hum;
  //document.getElementById("sensorLoud").innerHTML = loud;
  document.getElementById("timestampIdEnv").innerHTML = timestamp;
}

function run_main(){
  set_disconnected_state();
  if(typeof(Storage) !== "undefined") {
    document.getElementById('usernameInput').value = localStorage.getItem("username");
    document.getElementById('passwordInput').value = localStorage.getItem("password");
    document.getElementById('brokerInput').value = localStorage.getItem("broker_url");
    connect();
  }
}

function disconnect(){
  client.end();
  set_disconnected_state();
}

function connect(){
  var username = document.getElementById('usernameInput').value;
  var password = document.getElementById('passwordInput').value;
  var broker_url = document.getElementById('brokerInput').value;
  if(typeof(Storage) !== "undefined") {
    localStorage.setItem("username", username)
    localStorage.setItem("password", password);
    localStorage.setItem("broker_url", broker_url);
  }
  client  = mqtt.connect(broker_url, {"username":username, "password":password, "rejectUnauthorized": false});
  client.on('message', onMessageArrived);
  client.on('connect', onConnect);
  //client.on('close', );
  //client.on('reconnect', );
  client.on('offline', onConnectionLost);
  //client.on('error', );
}
