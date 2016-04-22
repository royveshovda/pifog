import json
import time
import settings
from shared import common
from datetime import datetime


handler = None


def init():
    global handler
    if settings.is_fake():
        from sensorpi import read_faker
        handler = read_faker
    else:
        from sensorpi import read
        handler = read
    return

loudness_sensor_pin = 0
dht_sensor_pin = 4


def on_connect(client, userdata, flags, rc):
    client.subscribe(settings.topic_sensorpi_command)
    client.subscribe(settings.topic_sensorpi_notify)
    common.send_connected(client, settings.topic_sensorpi_connection)


def handle_command(client, message):
    payload = message.payload.decode('utf-8')
    print("Command received:")
    print(payload)

    cmd = json.loads(payload)
    command = cmd["command"]
    cmd_id = cmd["id"]
    if command == "ping":
        common.send_pong(client, cmd_id, settings.topic_sensorpi_event)


def handle_notification(message):
    print("Notification received: " + str(message.payload))


def on_message(client, userdata, msg):
    if msg.topic == settings.topic_sensorpi_command:
        handle_command(client, msg)
        return
    if msg.topic == settings.topic_sensorpi_notify:
        handle_notification(msg)
        return
    print("Spam received: " + str(msg.payload))


def send_data(client, co2, temperature, humidity, loudness):
    # Prepare our sensor data in JSON format.
    payload = json.dumps({
        "state": {
            "co2": co2,
            "temperature": temperature,
            "humidity": humidity,
            "loudness": loudness,
            "timestamp": str(datetime.now())
        }
    })
    client.publish(settings.topic_sensorpi_event, payload, qos=1, retain=True)


def start():
    client = common.setup_mqtt(on_connect, on_message, settings.topic_sensorpi_connection)
    handler.setup(dht_sensor_pin, loudness_sensor_pin)
    d1 = datetime.min

    try:
        while True:
            [co2, temperature, humidity, loudness] = handler.read_data()
            timestamp = datetime.now().time().strftime("%H:%M:%S")
            handler.show_data(co2, temperature, humidity, loudness, timestamp)
            d2 = datetime.now()
            d = d2 - d1
            if d.total_seconds() > 60.0:
                send_data(client, co2, temperature, humidity, loudness)
                d1 = d2
    except KeyboardInterrupt:
        client.loop_stop()
        handler.cleanup()
        print('stopped')


def stop():
    return
