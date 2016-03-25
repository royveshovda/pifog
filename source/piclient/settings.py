import yaml

broker_endpoint = "NOT SET"
broker_username = "NOT SET"
broker_password = "NOT SET"
ca_certificate = "NOT SET"
device_name = "NOT SET"
device_type = "NOT_SET"
run_type = "NOT SET"

topic_doorpi_notify = "/World/Fog/1/DoorPi/Notify"
topic_doorpi_command = "/World/Fog/1/DoorPi/Command"
topic_doorpi_event = "/World/Fog/1/DoorPi/Event"
topic_doorpi_connection = "/World/Fog/1/DoorPi/Connection"

topic_statuspi_notify = "/World/Fog/1/StatusPi/Notify"
topic_statuspi_command = "/World/Fog/1/StatusPi/Command"
topic_statuspi_event = "/World/Fog/1/StatusPi/Event"
topic_statuspi_connection = "/World/Fog/1/StatusPi/Connection"

topic_camerapi_notify = "/World/Fog/1/CameraPi/Notify"
topic_camerapi_command = "/World/Fog/1/CameraPi/Command"
topic_camerapi_event = "/World/Fog/1/CameraPi/Event"
topic_camerapi_connection = "/World/Fog/1/CameraPi/Connection"

topic_buttonpi_notify = "/World/Fog/1/ButtonPi/Notify"
topic_buttonpi_command = "/World/Fog/1/ButtonPi/Command"
topic_buttonpi_event = "/World/Fog/1/ButtonPi/Event"
topic_buttonpi_connection = "/World/Fog/1/ButtonPi/Connection"


def load_settings(filename):
    stream = open(filename, 'r')
    settings_from_file = yaml.load(stream)
    global broker_endpoint
    global broker_username
    global broker_password
    global ca_certificate
    global device_name
    global device_type
    global run_type

    broker_endpoint = settings_from_file["broker_endpoint"]
    broker_username = settings_from_file["broker_username"]
    broker_password = settings_from_file["broker_password"]
    ca_certificate = settings_from_file["ca_certificate"]
    device_name = settings_from_file["device_name"]
    device_type = settings_from_file["device_type"]
    run_type = settings_from_file["run_type"]

def is_fake():
    if(run_type != "live"):
        return True
    else:
        return False
