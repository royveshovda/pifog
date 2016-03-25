import json
import time

import settings
from shared import common

# Will accept command looking like this:
# {"command":"open-door","id":"123"}


pin_button = 0
hold_open_time_in_seconds = 5
handler = None


def init():
    global handler
    if settings.is_fake():
        from buttonpi import piface_faker
        handler = piface_faker
    else:
        from buttonpi import piface
        handler = piface
    return


def on_connect(client2, userdata, flags, rc):
    client2.subscribe(settings.topic_buttonpi_command)
    client2.subscribe(settings.topic_buttonpi_notify)
    common.send_connected(client2, settings.topic_buttonpi_connection)


def push_open_door_button(client, cmd_id):
    handler.set_state(pin_button, 1)
    time.sleep(hold_open_time_in_seconds)
    handler.set_state(pin_button, 0)
    common.send_open_command_executed(client, cmd_id, "open-door", settings.topic_buttonpi_event)


def handle_command(client, message):
    payload = message.payload.decode('utf-8')
    print("Command received:")
    print(payload)

    cmd = json.loads(payload)
    command = cmd["command"]
    cmd_id = cmd["id"]
    if command == "open-door":
        push_open_door_button(client, cmd_id)
    if command == "ping":
        common.send_pong(client, cmd_id, settings.topic_buttonpi_event)


def handle_notification(message):
    print("Notification received: " + str(message.payload))


# This is called when we receive a subscription notification from Broker.
def on_message(client, userdata, msg):
    if msg.topic == settings.topic_buttonpi_command:
        handle_command(client, msg)
        return
    if msg.topic == settings.topic_buttonpi_notify:
        handle_notification(msg)
        return
    print("Spam received: " + str(msg.payload))


def start():
    client = common.setup_mqtt(on_connect, on_message, settings.topic_buttonpi_connection)
    handler.init()

    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        client.loop_stop()
        handler.deinit()
        print('stopped')


def stop():
    handler.deinit()
    return
