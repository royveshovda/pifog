# PiFog
PiFog is a collection of Raspberry Pis used to solve some specific problems. Not big problems, but still problems.

Even though the project solves some problems, the higher goal is to test out technologies and concepts related to IoT.

## Fog?
Why not use Cloud? They could work. Both Amazon and Microsoft have decent offerings. All services come as a centralized service, meaning all connected components have to connect to the cloud provider as the very first step. All communication needs to go in and out of that provider.
This has a cost benefit, but comes at a lock-in price. The system can also be made more resilient to infrastructure errors if not everything is connected to the cloud. Parts of the system can benefit from connect as locally as possible. Hence the word fog. The architecture in this system (not fully deployed yet) will have both local connectivity and cloud back-bone (for things like machine learning and long term storage).

## Technical overview
The Pis are connected using MQTT and using a broker that is part of AWS IoT.
They communicate using the MQTT's builtin pub-sub. The structure of the MQTT topics and message types are part of the experimentation.

The communication also respects the protocol described by AWS to support what they call Shadow.

For now the code on the Pis are written in Python. This might change as the plan includes experimenting using different languages as well. Elixir happen to be high on that candidate list.

I addition there is a web client written in puse javascript to show the result on a web page.

![Overview](/Overview.png)

## DoorPi
The DoorPi is monitoring two toilet doors and publishing events when the state changes for any of them.
This is not the most accurate method of measuring occupancy, but will have to do in our case.

### Technical details
Raspberry Pi Model B (RPi 1) using GPIO.

## StatusPi
StatusPi subscribes to events from DoorPi, and shows the status on a LED matrix.
Green (plus) => both doors are open.
Yellow (diamond) => one of the doors are open.
Red (cross) => both doors are closed.
StatusPi also gets reading from the Sense Hat, and publishes the data every minute. The temperature readings from the Sense Hat is very unreliable in the current casing, due to heat from the CPU.

### Technical details
Raspberry Pi 3 Model B with a Sense Hat.


## CameraPi (Not ready yet)
CameraPi will take a picture of visitors ate the door, and send a message containing the image.
Facial recognition could be a nice feature here, but strictly not needed.


## ButtonPi (Not ready yet)
ButtonPi simply pushes a button to open the front door.

## WebClient
Very simple web client using nothing but HTML and javascript.

## Improvements
- Describe how AWS IoT is set up.
- Share Slack integration
- Describe Slack integration
- Update schematics
