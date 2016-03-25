from sense_hat import SenseHat


sense = SenseHat()

BLACK = [0, 0, 0]
WHITE = [255, 255, 255]
RED = [255, 0, 0]
YELLOW = [255, 150, 0]
GREEN = [0, 255, 0]


def init():
    sense.clear()


def generate_diamond(foreground, background):
    x = foreground
    o = background
    return [
    o, o, o, x, x, o, o, o,
    o, o, x, x, x, x, o, o,
    o, x, x, x, x, x, x, o,
    x, x, x, x, x, x, x, x,
    x, x, x, x, x, x, x, x,
    o, x, x, x, x, x, x, o,
    o, o, x, x, x, x, o, o,
    o, o, o, x, x, o, o, o
    ]


def generate_plus(foreground, background):
    x = foreground
    o = background
    return [
    o, o, o, x, x, o, o, o,
    o, o, o, x, x, o, o, o,
    o, o, o, x, x, o, o, o,
    x, x, x, x, x, x, x, x,
    x, x, x, x, x, x, x, x,
    o, o, o, x, x, o, o, o,
    o, o, o, x, x, o, o, o,
    o, o, o, x, x, o, o, o
    ]


def generate_matrix_cross(foreground, background):
    x = foreground
    o = background
    return [
    x, x, o, o, o, o, x, x,
    x, x, x, o, o, x, x, x,
    o, x, x, x, x, x, x, o,
    o, o, x, x, x, x, o, o,
    o, o, x, x, x, x, o, o,
    o, x, x, x, x, x, x, o,
    x, x, x, o, o, x, x, x,
    x, x, o, o, o, o, x, x
    ]


def fill(color):
    sense.clear(color)


def display(matrix):
    sense.set_pixels(matrix)


def set_black():
    fill(BLACK)


def display_unknown():
    color = (0, 255, 255)
    sense.set_rotation(90)
    sense.show_letter("?", text_colour=color)


def display_blank():
    set_black()


def display_maybe():
    m = generate_diamond(YELLOW, BLACK)
    display(m)


def display_go():
    m = generate_plus(GREEN, BLACK)
    display(m)


def display_stop():
    m = generate_matrix_cross(RED, BLACK)
    display(m)
