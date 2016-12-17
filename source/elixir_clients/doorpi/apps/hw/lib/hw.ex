defmodule Hw do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      worker(Hw.GpioWorker, []),
    ]

    opts = [strategy: :one_for_one, name: Hw.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
