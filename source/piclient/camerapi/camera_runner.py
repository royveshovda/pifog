import json
import time
import paho.mqtt.client as mqtt
import settings
from datetime import datetime
import base64
from shared import common

# Will accept command looking like this:
# {"command":"take-picture","id":"123"}


handler = None


def init():
    global handler
    if settings.is_fake():
        from camerapi import camerahandler_faker
        handler = camerahandler_faker
    else:
        from camerapi import camerahandler
        handler = camerahandler
    return


default_filename = 'tmp.jpg'


def on_connect(client, userdata, flags, rc):
    client.subscribe(settings.topic_camerapi_command)
    client.subscribe(settings.topic_camerapi_notify)
    common.send_connected(client, settings.topic_camerapi_connection)


def take_picture(client, cmd_id, high_res):
    if(high_res):
        filename = handler.capture_high_res(default_filename)
    else:
        filename = handler.capture_low_res(default_filename)

    converted_image = convert_image_to_base64(filename)
    send_picture(client, cmd_id, converted_image)


def convert_image_to_base64(filename):
    with open(filename, "rb") as image_file:
        # TODO: Improve encoding???
        encoded = base64.b64encode(image_file.read()).decode('utf-8')
    return encoded


def handle_command(client, message):
    payload = message.payload.decode('utf-8')
    print("Command received:")
    print(payload)

    cmd = json.loads(payload)
    command = cmd["command"]
    cmd_id = cmd["id"]
    if command == "take-picture-low-res":
        take_picture(client, cmd_id, False)
    if command == "take-picture-high-res":
        take_picture(client, cmd_id, True)
    if command == "ping":
        common.send_pong(client, cmd_id, settings.topic_camerapi_event)


def handle_notification(message):
    print("Notification received: " + str(message.payload))


def send_picture(client, cmd_id, image_as_base64):
    payload = json.dumps({
        "picture": {
            "image": image_as_base64,
            "encoding": "data:image/jpg;base64",
            "response-to": cmd_id,
            "timestamp": str(datetime.now())
        }
    })
    client.publish(settings.topic_camerapi_event, payload, qos=0, retain=False)


def send_open_command_executed(client, cmd_id):
    payload = json.dumps({
        "command-executed": {
            "command": "take-picture",
            "id": cmd_id,
            "timestamp": str(datetime.now())
        }
    })
    client.publish(settings.topic_camerapi_event, payload, qos=1, retain=False)


# This is called when we receive a subscription notification from Broker.
def on_message(client, userdata, msg):
    if msg.topic == settings.topic_camerapi_command:
        handle_command(client, msg)
        return
    if msg.topic == settings.topic_camerapi_notify:
        handle_notification(msg)
        return
    print("Spam received: " + str(msg.payload))


def start():
    client = common.setup_mqtt(on_connect, on_message, settings.topic_camerapi_connection)

    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        client.loop_stop()
        print('stopped')


def stop():
    return
