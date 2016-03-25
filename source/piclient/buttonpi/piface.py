import pifacedigitalio as p


def init():
    p.init()


def set_state(pin, state):
    p.digital_write(pin, state)


def deinit():
    p.deinit()
