import json
import time
import settings
from shared import common
from datetime import datetime
from uptime import boottime

handler = None
loudness_sensor_pin = 2
dht_sensor_pin = 4

def init():
    global handler
    if settings.is_fake():
        from sensorpi import read_faker
        handler = read_faker
    else:
        from sensorpi import read
        handler = read
    return


def customShadowCallback_Update(payload, responseStatus, token):
    if responseStatus == "timeout":
        print("Update request " + token + " time out!")
    if responseStatus == "accepted":
        payloadDict = json.loads(payload)
        print("~~~~~~~~~~~~~~~~~~~~~~~")
        print("Update request with token: " + token + " accepted!")
        reported = payloadDict["state"]["reported"]
        if "temperature" in reported:
            print("temperature: " + str(payloadDict["state"]["reported"]["temperature"]))
        if "humidity" in reported:
            print("humidity: " + str(payloadDict["state"]["reported"]["humidity"]))
        if "co2" in reported:
            print("co2: " + str(payloadDict["state"]["reported"]["co2"]))
        if "connected" in reported:
            print("connected: " + str(payloadDict["state"]["reported"]["connected"]))

        print("~~~~~~~~~~~~~~~~~~~~~~~\n\n")
    if responseStatus == "rejected":
        print("Update request " + token + " rejected!")


def should_read_co2(boot_time):
    d2 = datetime.now()
    d = d2 - boot_time
    if d.total_seconds() > 200.0:
        return True
    else:
        return False


def on_connect(client, userdata, flags, rc):
    client.subscribe(settings.topic_sensorpi_command)
    client.subscribe(settings.topic_sensorpi_notify)
    common.send_connected(client, settings.topic_sensorpi_connection)


def handle_command(client, message):
    payload = message.payload.decode('utf-8')
    print("Command received:")
    print(payload)

    #cmd = json.loads(payload)
    #command = cmd["command"]
    #cmd_id = cmd["id"]
    #if command == "ping":
    #    common.send_pong(client, cmd_id, settings.topic_sensorpi_event)


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
            "reported": {
                "co2": co2,
                "temperature": temperature,
                "humidity": humidity
            }
        }
    })
    client.shadowUpdate(payload, customShadowCallback_Update, 5)


def start():
    time.sleep(20)

    shadow, client = common.setup_aws_shadow_client(settings.aws_endpoint,
                                                    settings.aws_root_certificate,
                                                    settings.aws_private_key,
                                                    settings.aws_certificate,
                                                    settings.device_name)

    JSONPayload = '{"state":{"reported":{"connected":"true"}}}'
    client.shadowUpdate(JSONPayload, customShadowCallback_Update, 5)

    handler.setup(dht_sensor_pin, loudness_sensor_pin)
    d1 = datetime.min
    boot_time = boottime()
    should_read = False
    try:
        while True:
            d2 = datetime.now()
            d = d2 - d1
            if d.total_seconds() > 10.0:
                if (should_read == False):
                    should_read = should_read_co2(boot_time)
                [co2, temperature, humidity, loudness] = handler.read_data(should_read)
                send_data(client, co2, temperature, humidity, loudness)
                d1 = d2
            else:
                time.sleep(1)
    except KeyboardInterrupt:
        JSONPayload = '{"state":{"reported":{"connected":"false"}}}'
        client.shadowUpdate(JSONPayload, customShadowCallback_Update, 5)
        shadow.disconnect()
        handler.cleanup()
        print('stopped')


def stop():
    return
