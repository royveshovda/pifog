var id = Math.floor((Math.random() * 1000000) + 1);
var client_name = "web_client_doorman_" + id;
//var subscribe_topic_name_toiletpi = "/World/Things/toiletpi/Event";
var subscribe_topic_name_camerapi = "/World/Fog/1/CameraPi/Event";
var publish_topic_name_buttonpi = "/World/Fog/1/ButtonPi/Command";
var publish_topic_name_camerapi = "/World/Fog/1/CameraPi/Command";

function onConnect() {
  console.log("onConnect");
  //TODO: Subscribe to event coming back from commands
  client.subscribe(subscribe_topic_name_camerapi);

  document.getElementById("brokerSection").style.display = 'none';
  document.getElementById("usernameSection").style.display = 'none';
  document.getElementById("passwordSection").style.display = 'none';
  document.getElementById("connectButton").style.display = 'none';
  document.getElementById("disconnectButton").style.display = 'block';
  document.getElementById("openDoorButton").disabled=false;
  document.getElementById("getSmallPictureButton").disabled=false;
  document.getElementById("getLargePictureButton").disabled=false;
}

function set_disconnected_state(){
  document.getElementById("brokerSection").style.display = 'block';
  document.getElementById("usernameSection").style.display = 'block';
  document.getElementById("passwordSection").style.display = 'block';
  document.getElementById("connectButton").style.display = 'block';
  document.getElementById("disconnectButton").style.display = 'none';

  document.getElementById("timestampId").innerHTML = "?";
  document.getElementById("openDoorButton").disabled=true;
  document.getElementById("getSmallPictureButton").disabled=true;
  document.getElementById("getLargePictureButton").disabled=true;
}

function open_door(){
  //TODO: improve the handling of the ID
  message = '{"command":"open-door","id":"123"}';
  client.publish(publish_topic_name_buttonpi, message);
}

function get_picture_small(){
  //TODO: improve the handling of the ID
  message = '{"command":"take-picture-low-res","id":"123"}';
  client.publish(publish_topic_name_camerapi, message);
}

function get_picture_large(){
  //TODO: improve the handling of the ID
  message = '{"command":"take-picture-high-res","id":"123"}';
  client.publish(publish_topic_name_camerapi, message);
}

function onConnectionLost() {
  set_disconnected_state();
}

function onMessageArrived(topic, message_raw, packet) {
  //console.log("onMessageArrived:"+message_raw);
  if(topic == subscribe_topic_name_camerapi)
  {
      var message = eval('(' + message_raw + ')');
      if(message.picture != undefined){
        picture = message.picture;
        document.getElementById("imageId").src= picture.encoding + "," + picture.image;
      }
  }

  //if(report.state != undefined){
  //  var door1 = report.state.reported.door1;
  //  var door2 = report.state.reported.door2;
  //  var timestamp = report.state.reported.timestamp;
  //  set_general_state(door1, door2);
  //}

  //data:image/jpeg;base64,
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
