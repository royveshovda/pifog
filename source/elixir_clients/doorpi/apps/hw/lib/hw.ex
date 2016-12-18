defmodule Hw do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    pins = Application.get_env(:hw, :pins)
    IO.inspect pins
    children = [
      worker(Hw.GpioWorker, [pins]),
    ]

    opts = [strategy: :one_for_one, name: Hw.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
