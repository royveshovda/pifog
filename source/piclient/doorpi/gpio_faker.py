from random import randint


def setup(_pin1, _pin2, _pin1_led, _pin2_led):
    # do nothing
    return


def get_state(_pin: int):
    # Return randomly True or False
    temp = randint(0,1)
    if temp == 1:
        return True
    else:
        return False


def set_state(_pin, _state):
    # do nothing
    return


def cleanup():
    # do nothing
    return


def signal_startup(_led1, _led2):
    # do nothing
    return
