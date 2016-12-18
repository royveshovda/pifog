defmodule Hw do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    pins = Application.get_env(:hw, :pins)
    parameters = %{pin_door1: pins[:pin_door1],
                   pin_door2: pins[:pin_door2],
                   pin_led1: pins[:pin_led1],
                   pin_led2: pins[:pin_led2]}
    children = [
      worker(Hw.GpioWorker, [parameters]),
    ]

    opts = [strategy: :one_for_one, name: Hw.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
