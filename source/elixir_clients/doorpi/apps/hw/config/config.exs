use Mix.Config

config :logic,
  name: "DoorPiEx"

config :hw, :pins
  pin_door1: 17,
  pin_door2: 18,
  pin_led1: 27,
  pin_led2: 22

import_config "config.secret.exs"
