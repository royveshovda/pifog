defmodule Doorpi do
  use Application
  alias Nerves.InterimWiFi, as: WiFi

  # See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    # Define workers and child supervisors to be supervised
    mqtt = Application.get_env(:doorpi, :mqtt)
    parameters = %{pi_name: "DoorPiEx",
                   host: mqtt[:host],
                   port: mqtt[:port],
                   username: mqtt[:username],
                   passeord: mqtt[:password],
                   cacert: "cacert.pem"}
    children = [
      worker(Task, [fn -> network end], restart: :transient),
      worker(Doorpi.MqttWorker, [parameters]),
      worker(Doorpi.GpioWorker, []),
    ]

    # See http://elixir-lang.org/docs/stable/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Doorpi.Supervisor]
    Supervisor.start_link(children, opts)
  end

  def network do
    wlan_config = Application.get_env(:doorpi, :wlan0)
    WiFi.setup "wlan0", wlan_config
  end

end
