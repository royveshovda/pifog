import yaml

aws_endpoint = "NOT SET"
aws_root_certificate = "NOT SET"
aws_certificate = "NOT SET"
aws_private_key = "NOT SET"
device_name = "NOT SET"
device_type = "NOT_SET"
run_type = "NOT SET"

def load_settings(filename):
    stream = open(filename, 'r')
    settings_from_file = yaml.load(stream)
    global aws_endpoint
    global aws_root_certificate
    global aws_certificate
    global aws_private_key
    global device_name
    global device_type
    global run_type

    aws_endpoint = settings_from_file["aws_endpoint"]
    aws_root_certificate = settings_from_file["aws_root_certificate"]
    aws_certificate = settings_from_file["aws_certificate"]
    aws_private_key = settings_from_file["aws_private_key"]
    device_name = settings_from_file["device_name"]
    device_type = settings_from_file["device_type"]
    run_type = settings_from_file["run_type"]

def is_fake():
    if(run_type != "live"):
        return True
    else:
        return False
