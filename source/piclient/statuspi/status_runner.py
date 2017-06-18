import json
import time
import settings
from datetime import datetime
from shared import common
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTShadowClient

handler = None
send_interval = 60 # in seconds
doorpi_update_topic = '$aws/things/DoorPi/shadow/update/accepted'


def init():
    global handler
    if settings.is_fake():
        from statuspi import statushandler_faker
        handler = statushandler_faker
    else:
        from statuspi import statushandler
        handler = statushandler
    return

def customShadowCallback_Update(payload, responseStatus, token):
    if responseStatus == "timeout":
        print("Update request " + token + " time out!")
    if responseStatus == "accepted":
        payloadDict = json.loads(payload)
        print("~~~~~~~~~~~~~~~~~~~~~~~")
        print("Update request with token: " + token + " accepted!")
        reported = payloadDict["state"]["reported"]
        if "temperature_from_pressure" in reported:
            print("temperature_from_pressure: " + str(payloadDict["state"]["reported"]["temperature_from_pressure"]))
        if "temperature_from_humidity" in reported:
            print("temperature_from_humidity: " + str(payloadDict["state"]["reported"]["temperature_from_humidity"]))
        if "humidity" in reported:
            print("humidity: " + str(payloadDict["state"]["reported"]["humidity"]))
        if "pressure" in reported:
            print("pressure: " + str(payloadDict["state"]["reported"]["pressure"]))
        if "connected" in reported:
            print("connected: " + str(payloadDict["state"]["reported"]["connected"]))
        print("~~~~~~~~~~~~~~~~~~~~~~~\n\n")
    if responseStatus == "rejected":
        print("Update request " + token + " rejected!")


def customCallback(client, userdata, message):
    if(message.topic == doorpi_update_topic):
        payloadDict = json.loads(message.payload.decode('utf8'))
        #print(json.dumps(payloadDict, indent=4, sort_keys=True))
        reported = payloadDict["state"]["reported"]
        if "connected" in reported:
            if(reported["connected"] == "false"):
                set_status('false', "closed", "closed")
                return

        if "MaleDoor" in reported and "FemaleDoor" in reported:
            m = reported["MaleDoor"]
            f = reported["FemaleDoor"]
            set_status('true', m, f)


def customDoorPiShadowCallback_Get(payload, responseStatus, token):
    print(responseStatus)
    payloadDict = json.loads(payload)
    print("++++++++FULL++++++++++")
    door1 = payloadDict["state"]["reported"]["FemaleDoor"]
    door2 = payloadDict["state"]["reported"]["MaleDoor"]
    connected = payloadDict["state"]["reported"]["connected"]
    print("Female: " + door1)
    print("Male: " + door2)
    print("Connected: " + connected)
    print("+++++++++++++++++++++++\n\n")
    set_status(connected, door1, door2)


def handle_command(client, message):
    payload = message.payload.decode('utf-8')
    print("Command received:")
    print(payload)


def set_status(connected, door1, door2):
    if connected == 'false':
        handler.display_unknown()
    else:
        if door1 == 'open' and door2 == 'open':
            handler.display_go()
        else:
            if door1 == 'open' or door2 == 'open':
                handler.display_maybe()
            else:
                handler.display_stop()


def handle_notification(message):
    print("Notification received: " + str(message.payload))


def send_sensor_data(client):
    # Prepare our sensor data in JSON format.
    payload = json.dumps({
        "state": {
            "reported": {
                "humidity": handler.get_humidity(),
                "temperature_from_humidity": handler.get_temperature_from_humidity(),
                "temperature_from_pressure": handler.get_temperature_from_pressure(),
                "pressure": handler.get_pressure(),
                "timestamp": str(datetime.now())
            }
        }
    })
    client.shadowUpdate(payload, customShadowCallback_Update, 5)


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
    time.sleep(20)

    shadow, client = common.setup_aws_shadow_client(settings.aws_endpoint,
                                                    settings.aws_root_certificate,
                                                    settings.aws_private_key,
                                                    settings.aws_certificate,
                                                    settings.device_name)

    JSONPayload = '{"state":{"reported":{"connected":"true"}}}'
    client.shadowUpdate(JSONPayload, customShadowCallback_Update, 5)

    door_shadow = shadow.createShadowHandlerWithName("DoorPi", True)
    door_shadow.shadowGet(customDoorPiShadowCallback_Get, 5)
    shadow.getMQTTConnection().subscribe(doorpi_update_topic, 1, customCallback)

    try:
        while True:
            send_sensor_data(client)
            time.sleep(send_interval)
    except KeyboardInterrupt:
        JSONPayload = '{"state":{"reported":{"connected":"false"}}}'
        client.shadowUpdate(JSONPayload, customShadowCallback_Update, 5)
        shadow.disconnect()
        print('stopped')


def stop():
    handler.display_blank()
