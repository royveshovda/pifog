# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# Import target specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
# Uncomment to use target specific configurations

# config :doorpi, :mqtt,
#   host: 'hostname',
#   port: 8883,
#   username: "un",
#   password: "pw"

config :doorpi, :wlan0,
 ssid: "Nerves",
 psk: "GoGoNerves12"



import_config "config.secret.exs"

# import_config "#{Mix.Project.config[:target]}.exs"
