import RPi.GPIO as GPIO
import time


def setup(pin1, pin2, pin1_led, pin2_led):
    GPIO.setmode(GPIO.BOARD)
    # GPIO.setup(pin1, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    # GPIO.setup(pin2, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(pin1, GPIO.IN)
    GPIO.setup(pin2, GPIO.IN)
    GPIO.setup(pin1_led, GPIO.OUT)
    GPIO.setup(pin2_led, GPIO.OUT)
    GPIO.output(pin1_led, False)
    GPIO.output(pin2_led, False)


def get_state(pin: int):
    return GPIO.input(pin)


def set_state(pin, state):
    GPIO.output(pin, state)


def cleanup():
    GPIO.cleanup()


def signal_startup(led1, led2):
    GPIO.output(led1, True)
    time.sleep(.5)
    GPIO.output(led1, False)
    GPIO.output(led2, True)
    time.sleep(.5)
    GPIO.output(led1, True)
    GPIO.output(led2, False)
    time.sleep(.5)
    GPIO.output(led1, False)
    GPIO.output(led2, True)
    time.sleep(.5)
    GPIO.output(led1, True)
    GPIO.output(led2, True)
    time.sleep(.25)
    GPIO.output(led1, False)
    GPIO.output(led2, False)
    time.sleep(.25)
    GPIO.output(led1, True)
    GPIO.output(led2, True)
    time.sleep(.25)
    GPIO.output(led1, False)
    GPIO.output(led2, False)
    time.sleep(.25)
    GPIO.output(led1, True)
    GPIO.output(led2, True)
    time.sleep(.25)
