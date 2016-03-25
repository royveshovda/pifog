var id = Math.floor((Math.random() * 1000000) + 1);
var client_name = "web_client_index_" + id;
var subscribe_topic_name_camerapi_connection = "/World/Fog/1/CameraPi/Connection";
var subscribe_topic_name_doorpi_connection = "/World/Fog/1/DoorPi/Connection";
var subscribe_topic_name_statuspi_connection = "/World/Fog/1/StatusPi/Connection";
var subscribe_topic_name_buttonpi_connection = "/World/Fog/1/ButtonPi/Connection";

function onConnect() {
  console.log("onConnect");
  client.subscribe(subscribe_topic_name_camerapi_connection);
  client.subscribe(subscribe_topic_name_doorpi_connection);
  client.subscribe(subscribe_topic_name_statuspi_connection);
  client.subscribe(subscribe_topic_name_buttonpi_connection);

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

  document.getElementById("statusDoorPi").style.backgroundColor = 'black';
  document.getElementById("statusCameraPi").style.backgroundColor = 'black';
  document.getElementById("statusButtonPi").style.backgroundColor = 'black';
  document.getElementById("statusStatusPi").style.backgroundColor = 'black';
}

function onConnectionLost() {
  set_disconnected_state();
}

function onMessageArrived(topic, message_raw, packet) {
  console.log("onMessageArrived:"+message_raw);
  var message = eval('(' + message_raw + ')');
  if(topic == subscribe_topic_name_camerapi_connection)
  {
    var element = document.getElementById("statusCameraPi");
    set_status(element, message);
  }else if (topic == subscribe_topic_name_doorpi_connection) {
    var element = document.getElementById("statusDoorPi");
    set_status(element, message);
  }else if (topic == subscribe_topic_name_statuspi_connection) {
    var element = document.getElementById("statusStatusPi");
    set_status(element, message);
  }else if (topic == subscribe_topic_name_buttonpi_connection) {
    var element = document.getElementById("statusButtonPi");
    set_status(element, message);
  }
}

function set_status(element, message){
  if(message.connected != undefined){
    element.style.backgroundColor = 'green';
  }else if (message.disconnected != undefined) {
    element.style.backgroundColor = 'red';
  }else{
    element.style.backgroundColor = 'black';
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
