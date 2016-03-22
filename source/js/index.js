var broker_port = 8083;
var broker_path = "/mqtt";
var id = Math.floor((Math.random() * 1000000) + 1);
var client_name = "web_client_" + id;
var subscribe_topic_name_toiletpi = "/World/Things/toiletpi/Event";
var subscribe_topic_name_camerapi = "/World/Things/camerapi/Event";

function onConnect() {
  console.log("onConnect");
  client.subscribe(subscribe_topic_name_toiletpi);
  client.subscribe(subscribe_topic_name_camerapi);

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

  document.getElementById("circle1").style.backgroundColor = 'black';
  document.getElementById("circle2").style.backgroundColor = 'black';
  document.getElementById("timestampId").innerHTML = "?";
  var red = document.getElementById('redStatus');
  var yellow = document.getElementById('yellowStatus');
  var green = document.getElementById('greenStatus');
  red.style.display = 'none'
  yellow.style.display = 'none'
  green.style.display = 'none'
}

function open_door(){
  message = new Paho.MQTT.Message('{"command":"open-door","id":"123"}');
  message.destinationName = "/World/Things/buttonpi/Command";
  client.send(message);
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
    set_disconnected_state();
  }
}

function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.payloadString);
  var report = eval('(' + message.payloadString + ')');
  if(report.state != undefined){
    var door1 = report.state.reported.door1;
    var door2 = report.state.reported.door2;
    var timestamp = report.state.reported.timestamp;
    set_doors_state(door1, door2, timestamp);
    set_general_state(door1, door2);
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
    document.getElementById("timestampId").innerHTML = timestamp;
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
  client.disconnect();
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
  client = new Paho.MQTT.Client(broker_url, broker_port, broker_path, client_name);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.connect({onSuccess:onConnect, userName:username, password:password});
}
