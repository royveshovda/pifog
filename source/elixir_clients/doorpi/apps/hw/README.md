# Hw

**TODO: Add description**

## Installation

If [available in Hex](https://hex.pm/docs/publish), the package can be installed as:

  1. Add `hw` to your list of dependencies in `mix.exs`:

    ```elixir
    def deps do
      [{:hw, "~> 0.1.0"}]
    end
    ```

  2. Ensure `hw` is started before your application:

    ```elixir
    def application do
      [applications: [:hw]]
    end
    ```

  To create a release, add a file called pifig.service in /lib/systemd/system/
  run chmod 644 pifog.service



  [Unit]
  Description=PiFog Service running DoorPi
  After=network.target

  [Service]
  Type=simple
  Environment="HOME=/home/pi"
  ExecStart=/home/pi/pifog/source/elixir_clients/doorpi/_build/dev/rel/hw/bin/hw start
  ExecStop=/home/pi/pifog/source/elixir_clients/doorpi/_build/dev/rel/hw/bin/hw stop
  RemainAfterExit=yes

  [Install]
  WantedBy=multi-user.target
