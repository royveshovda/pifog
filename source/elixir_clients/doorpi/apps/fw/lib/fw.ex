defmodule Fw do
  use Application
  alias Nerves.InterimWiFi, as: WiFi

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      worker(Task, [fn -> network end], restart: :transient)
    ]

    opts = [strategy: :one_for_one, name: Fw.Supervisor]
    Supervisor.start_link(children, opts)
  end

  def network do
    wlan_config = Application.get_env(:doorpi, :wlan0)
    WiFi.setup "wlan0", wlan_config
  end
end
