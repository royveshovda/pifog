from time import sleep
import picamera

rotate = 0
time_to_warmup = 2

# camera = None


def init():
    #global camera
    #camera = picamera.PiCamera()
    #camera.rotation = rotate
    #camera.start_preview()
    return


def capture_high_res(filename):
    camera = picamera.PiCamera()
    try:
        camera.rotation = rotate
        # camera.start_preview()
        # sleep(time_to_warmup)
        # camera.capture(filename, resize=(2592, 1944))
        camera.capture(filename, resize=(1900, 1200))
        # camera.stop_preview()
        pass
    finally:
        camera.close()
    return filename


def capture_low_res(filename):
    camera = picamera.PiCamera()
    try:
        camera.rotation = rotate
        # camera.start_preview()
        # sleep(time_to_warmup)
        camera.capture(filename, resize=(500, 281))
        # camera.stop_preview()
        pass
    finally:
        camera.close()
    return filename


def deinit():
    #camera.stop_preview()
    return
