from blinkt import set_pixel, set_brightness, show, clear


def init():
    set_brightness(0.1)


def display_unknown():
    clear()
    set_pixel(0, 0, 255, 255)
    set_pixel(1, 0, 255, 255)
    set_pixel(2, 0, 255, 255)
    set_pixel(3, 0, 255, 255)
    set_pixel(4, 0, 255, 255)
    set_pixel(5, 0, 255, 255)
    set_pixel(6, 0, 255, 255)
    set_pixel(7, 0, 255, 255)
    show()


def display_blank():
    clear()
    show()


def display_male_closed():
    clear()
    set_pixel(1, 0, 255, 0)
    set_pixel(2, 0, 255, 0)
    set_pixel(4, 255, 0, 0)
    set_pixel(5, 255, 0, 0)
    set_pixel(6, 255, 0, 0)
    set_pixel(7, 255, 0, 0)
    show()


def display_female_closed():
    print('RED/GREEN')
    clear()
    set_pixel(0, 255, 0, 0)
    set_pixel(1, 255, 0, 0)
    set_pixel(2, 255, 0, 0)
    set_pixel(3, 255, 0, 0)
    set_pixel(5, 0, 255, 0)
    set_pixel(6, 0, 255, 0)
    show()


def display_both_open():
    clear()
    set_pixel(1, 0, 255, 0)
    set_pixel(2, 0, 255, 0)
    set_pixel(5, 0, 255, 0)
    set_pixel(6, 0, 255, 0)
    show()


def display_both_closed():
    clear()
    set_pixel(0, 255, 0, 0)
    set_pixel(1, 255, 0, 0)
    set_pixel(2, 255, 0, 0)
    set_pixel(3, 255, 0, 0)
    set_pixel(4, 255, 0, 0)
    set_pixel(5, 255, 0, 0)
    set_pixel(6, 255, 0, 0)
    set_pixel(7, 255, 0, 0)
    show()
