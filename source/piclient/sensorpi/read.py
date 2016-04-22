import sensorpi.grove_oled
import sensorpi.grove_co2_lib
import time
import sensorpi.grovepi as grovepi

co2 = None
beep = None
dht_pin = None
loudness_pin = None
beep = None


def setup(pin_dht, pin_loudness):
    global dht_pin
    global loudness_pin
    global co2
    global beep
    dht_pin = pin_dht
    loudness_pin = pin_loudness
    co2 = sensorpi.grove_co2_lib.CO2()
    sensorpi.grove_oled.oled_init()
    sensorpi.grove_oled.oled_clearDisplay()
    sensorpi.grove_oled.oled_setNormalDisplay()
    sensorpi.grove_oled.oled_setVerticalMode()
    time.sleep(.1)
    beep = True


def read_data():
    try:
        [ppm,temp1]= co2.read()
        [temp2,humidity] = grovepi.dht(dht_pin, 1)
        loudness = grovepi.analogRead(loudness_pin)
        return [ppm, temp2, humidity, loudness]
    except IOError:
        print("Error")
        return [-1, -1, -1, -1]


def show_data(co2, temperature, humidity, loudness, timestamp):
    global beep
    co2_message = str(co2)
    if len(co2_message) == 3:
        co2_message = " " + co2_message

    temperature_message = str(temperature)
    humidity_message = str(humidity)
    loudness_message = str(loudness)

    sensorpi.grove_oled.oled_setTextXY(0, 0)
    sensorpi.grove_oled.oled_putString(timestamp + " ")
    sensorpi.grove_oled.oled_setTextXY(2, 0)
    sensorpi.grove_oled.oled_putString("Temp: " + temperature_message)
    sensorpi.grove_oled.oled_setTextXY(4, 0)
    sensorpi.grove_oled.oled_putString("CO2:" + co2_message + "ppm ")
    sensorpi.grove_oled.oled_setTextXY(7, 0)
    sensorpi.grove_oled.oled_putString("Humi: " + humidity_message)
    sensorpi.grove_oled.oled_setTextXY(9, 0)
    sensorpi.grove_oled.oled_putString("Loud: " + loudness_message)
    sensorpi.grove_oled.oled_setTextXY(10, 0)
    if beep:
        beep = False
        sensorpi.grove_oled.oled_putString(".")
    else:
        beep = True


def cleanup():
    return
