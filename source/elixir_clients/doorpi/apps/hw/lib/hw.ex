defmodule Hw do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    pins = Application.get_env(:hw, :pins)
    children = [
      worker(Hw.GpioWorker, [ pins.pin_door1,
                              pins.pin_door2,
                              pins.pin_led1,
                              pins.pin_led2]),
    ]

    opts = [strategy: :one_for_one, name: Hw.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
