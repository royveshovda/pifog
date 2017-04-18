import json
import time
import settings
from shared import common
from datetime import datetime
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTShadowClient
import logging


handler = None

pin_door1 = 11 #BCM17
pin_door2 = 12 # BCM18
pin_door1_led = 13 # BCM27
pin_door2_led = 15 # BCM22

def init():
    global handler
    if settings.is_fake():
        from doorpi import gpio_faker
        handler = gpio_faker
    else:
        from doorpi import gpio
        handler = gpio
    return

# Custom Shadow callback
def customShadowCallback_Update(payload, responseStatus, token):
    if responseStatus == "timeout":
        print("Update request " + token + " time out!")
    if responseStatus == "accepted":
        payloadDict = json.loads(payload)
        print("~~~~~~~~~~~~~~~~~~~~~~~")
        print("Update request with token: " + token + " accepted!")
        reported = payloadDict["state"]["reported"]
        if "FemaleDoor" in reported:
            print("FemaleDoor: " + str(payloadDict["state"]["reported"]["FemaleDoor"]))

        if "MaleDoor" in reported:
            print("MaleDoor: " + str(payloadDict["state"]["reported"]["MaleDoor"]))

        if "connected" in reported:
            print("connected: " + str(payloadDict["state"]["reported"]["connected"]))

        print("~~~~~~~~~~~~~~~~~~~~~~~\n\n")
    if responseStatus == "rejected":
        print("Update request " + token + " rejected!")


def handle_command(client, message):
    payload = message.payload.decode('utf-8')
    print("Command received:")
    print(payload)

    #cmd = json.loads(payload)
    #command = cmd["command"]
    #cmd_id = cmd["id"]
    #if command == "ping":
    #    common.send_pong(client, cmd_id, settings.topic_doorpi_event)


def handle_notification(message):
    print("Notification received: " + str(message.payload))


def on_message(client, userdata, msg):
    if msg.topic == settings.topic_doorpi_command:
        handle_command(client, msg)
        return
    if msg.topic == settings.topic_doorpi_notify:
        handle_notification(msg)
        return
    print("Spam received: " + str(msg.payload))


def send_data(client, door1_closed, door2_closed):
    if door1_closed:
        door1_message = "closed"
    else:
        door1_message = "open"

    if door2_closed:
        door2_message = "closed"
    else:
        door2_message = "open"

    # Prepare our sensor data in JSON format.
    payload = json.dumps({
        "state": {
            "reported": {
                "FemaleDoor": door1_message,
                "MaleDoor": door2_message
            }
        }
    })
    client.shadowUpdate(payload, customShadowCallback_Update, 5)


def new_state(pin, old_state):
    new_state_first = handler.get_state(pin)
    if new_state_first != old_state:
        time.sleep(0.5)
        new_state_verify = handler.get_state(pin)
        if new_state_verify != old_state:
            return True, new_state_verify
        else:
            return False, old_state
    else:
        return False, old_state


def set_led_state(door1_state, door2_state):
    handler.set_state(pin_door1_led, door1_state)
    handler.set_state(pin_door2_led, door2_state)


def start():
    shadow, client = common.setup_aws_shadow_client(settings.aws_endpoint,
                                                    settings.aws_root_certificate,
                                                    settings.aws_private_key,
                                                    settings.aws_certificate,
                                                    settings.device_name)
    JSONPayload = '{"state":{"reported":{"connected":"true"}}}'
    client.shadowUpdate(JSONPayload, customShadowCallback_Update, 5)

    handler.setup(pin_door1, pin_door2, pin_door1_led, pin_door2_led)

    handler.signal_startup(pin_door1_led, pin_door2_led)

    # Get initial state
    door1 = handler.get_state(pin_door1)
    door2 = handler.get_state(pin_door2)

    set_led_state(door1, door2)

    send_data(client, door1, door2)

    time.sleep(2)

    states_reported = 1
    try:
        while True:
            door1_changed, door1_state = new_state(pin_door1, door1)
            door2_changed, door2_state = new_state(pin_door2, door2)
            if door1_changed or door2_changed:
                door1 = door1_state
                door2 = door2_state
                set_led_state(door1, door2)
                send_data(client, door1, door2)
                states_reported += 1
                print('States reported: '+str(states_reported))
            time.sleep(0.2)
    except KeyboardInterrupt:
        JSONPayload = '{"state":{"reported":{"connected":"false"}}}'
        client.shadowUpdate(JSONPayload, customShadowCallback_Update, 5)
        shadow.disconnect()
        handler.cleanup()
        print('stopped')


def stop():
    return
