import json
import time
import paho.mqtt.client as mqtt
import settings
from datetime import datetime
from shared import common

handler = None


def init():
    global handler
    if settings.is_fake():
        from statuspi import statushandler_faker
        handler = statushandler_faker
    else:
        from statuspi import statushandler
        handler = statushandler
    return


def on_connect(client, userdata, flags, rc):
    client.subscribe(settings.topic_statuspi_command)
    client.subscribe(settings.topic_statuspi_notify)
    client.subscribe(settings.topic_doorpi_event)
    common.send_connected(client, settings.topic_statuspi_connection)


def handle_command(client, message):
    payload = message.payload.decode('utf-8')
    print("Command received:")
    print(payload)

    cmd = json.loads(payload)
    command = cmd["command"]
    cmd_id = cmd["id"]
    if command == "ping":
        common.send_pong(client, cmd_id, settings.topic_statuspi_event)


def handle_status_update(message):
    payload = message.payload.decode('utf-8')
    print("Status update received:")
    print(payload)

    ev = json.loads(payload)
    if 'state' in ev:
        state = ev['state']
        if 'door1' in state and 'door2' in state:
            door1 = state['door1']
            door2 = state['door2']
            set_status(door1, door2)


def set_status(door1, door2):
    if door1 == 'open' and door2 == 'open':
        handler.display_go()
    else:
        if door1 == 'open' or door2 == 'open':
            handler.display_maybe()
        else:
            handler.display_stop()


def handle_notification(message):
    print("Notification received: " + str(message.payload))


# This is called when we receive a subscription notification from Broker.
def on_message(client, userdata, msg):
    if msg.topic == settings.topic_statuspi_command:
        handle_command(client, msg)
        return
    if msg.topic == settings.topic_statuspi_notify:
        handle_notification(msg)
        return
    if msg.topic == settings.topic_doorpi_event:
        handle_status_update(msg)
        return
    print("Spam received: " + str(msg.payload))


def start():
    handler.init()
    handler.display_unknown()
    client = common.setup_mqtt(on_connect, on_message, settings.topic_statuspi_connection)

    try:
        while True:
            # TODO: Read sonsor-data on regular intervals and send
            time.sleep(60)
    except KeyboardInterrupt:
        client.loop_stop()
        handler.display_blank()
        print('stopped')


def stop():
    handler.display_blank()
