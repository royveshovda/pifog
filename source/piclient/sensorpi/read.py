import sensorpi.grove_co2_lib
import time
import sensorpi.grovepi

co2 = None
beep = None
dht_pin = None
loudness_pin = None


def setup(pin_dht, pin_loudness):
    global dht_pin
    global loudness_pin
    global co2
    global beep
    dht_pin = pin_dht
    loudness_pin = pin_loudness
    co2 = sensorpi.grove_co2_lib.CO2()
    time.sleep(.1)


def read_data(should_read_co2):
    try:
        ppm = "N/A"
        temp1 = "N/A"
        if(should_read_co2):
            [ppm,temp1] = co2.read()
        [temp2,humidity] = sensorpi.grovepi.dht(dht_pin,1)
        loudness = sensorpi.grovepi.analogRead(loudness_pin)
        return [ppm, temp2, humidity, loudness]
    except IOError:
        print("Error")
        return [-1, -1, -1, -1]


def cleanup():
    return