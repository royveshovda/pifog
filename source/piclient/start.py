import sys
import settings


def main(settings_filename):
    settings.load_settings(settings_filename)
    runner = get_runner(settings.device_type)

    runner.init()
    runner.start()


def get_runner(device_type):
    if device_type == "status":
        from statuspi import status_runner
        return status_runner
    elif device_type == "door":
        from doorpi import door_runner
        return door_runner
    elif device_type == "camera":
        from camerapi import camera_runner
        return camera_runner
    elif device_type == "button":
        from buttonpi import button_runner
        return button_runner
    elif device_type == "sensor":
        from sensorpi import sensor_runner
        return sensor_runner
    elif device_type == "blinkt":
        from blinktpi import blinkt_runner
        return blinkt_runner
    else:
        print('Device_Type must be set')
        return None


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
