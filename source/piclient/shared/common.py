from netifaces import interfaces, ifaddresses, AF_INET
from uptime import boottime
import json
from datetime import datetime
import paho.mqtt.client as mqtt
import settings
import time


def get_network_addresses_formated():
    all_addresses = []
    for ifaceName in interfaces():
        addresses = [i['addr'] for i in ifaddresses(ifaceName).setdefault(AF_INET, [{'addr':'No IP addr'}] )]
        if len(addresses) == 1:
            adr = addresses[0]
            if adr != 'No IP addr' and ifaceName != 'lo0':
                address = ifaceName + ': ' + adr
                all_addresses.append(address)
        else:
            address = ifaceName + ': ' + ', '.join(addresses)
            all_addresses.append(address)
    return ', '.join(all_addresses)


def get_boot_time_as_string():
    return str(boottime())


def send_connected(client, topic):
    boot_time = get_boot_time_as_string()
    addresses = get_network_addresses_formated()
    payload = json.dumps({
        "connected": {
            "boot_time": boot_time,
            "addresses": addresses,
            "timestamp": str(datetime.now())
        }
    })
    client.publish(topic, payload, qos=1, retain=True)


def send_pong(client, cmd_id, topic):
    payload = json.dumps({
        "pong": {
            "id": cmd_id,
            "timestamp": str(datetime.now())
        }
    })
    client.publish(topic, payload, qos=1, retain=False)


def on_log(client, userdata, level, buf):
    print("Log: " + buf)


def setup_mqtt(on_connect_callback, on_message_callback, last_will_topic):
    # Create an MQTT client for connecting to MQTT-broker.
    client = mqtt.Client(settings.device_name)
    client.on_connect = on_connect_callback
    client.on_message = on_message_callback

    client.on_log = on_log

    client.tls_set(settings.ca_certificate)

    client.username_pw_set(settings.broker_username, settings.broker_password)

    will = json.dumps({
        "disconnected": {
            "device": settings.device_name
        }
    })
    client.will_set(last_will_topic, will, 1, True)

    client.connect(settings.broker_endpoint, 8883, 60)

    client.loop_start()
    # Give connection a chance to establish
    time.sleep(1)
    return client


def send_open_command_executed(client, cmd_id, command_name, topic):
    payload = json.dumps({
        "command-executed": {
            "command": command_name,
            "id": cmd_id,
            "timestamp": str(datetime.now())
        }
    })
    client.publish(topic, payload, qos=1, retain=False)