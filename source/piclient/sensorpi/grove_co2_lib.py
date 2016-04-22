#!/usr/bin/env python
import serial
import struct

ser = serial.Serial('/dev/ttyAMA0',  9600)  # Open the serial port at 9600 baud


class CO2:
    inp =[]
    cmd_zero_sensor = "\xff\x87\x87\x00\x00\x00\x00\x00\xf2"
    cmd_span_sensor = "\xff\x87\x87\x00\x00\x00\x00\x00\xf2"
    cmd_get_sensor = "\xff\x01\x86\x00\x00\x00\x00\x00\x79"

    def __init__(self):
        # To open the raspberry serial port
        # ser = serial.Serial('/dev/ttyAMA0',  9600, timeout = 1)	#Open the serial port at 9600 baud

        # init serial
        ser.flush()

    def read(self):
        try:
            ser.write(self.cmd_get_sensor)
            self.inp = ser.read(9)
            high_level = struct.unpack('B',self.inp[2])[0]
            low_level = struct.unpack('B',self.inp[3])[0]
            temp_co2 = struct.unpack('B',self.inp[4])[0] - 40

            # output in ppm, temp
            conc = high_level*256+low_level
            return [conc, temp_co2]

        except IOError:
            return [-1, -1]
