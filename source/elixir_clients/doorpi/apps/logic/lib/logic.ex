defmodule Logic do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    mqtt = Application.get_env(:logic, :mqtt)
    pi_name = Application.get_env(:logic, :name)
    parameters = %{pi_name: pi_name,
                   host: mqtt[:host],
                   port: mqtt[:port],
                   username: mqtt[:username],
                   passeord: mqtt[:password],
                   cacert: "cacert.pem"}
    children = [
      worker(Logic.MqttWorker, [parameters])
    ]

    opts = [strategy: :one_for_one, name: Logic.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
