defmodule Doorpi.GpioWorker do
  use GenServer

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def set_led1(value) do
    GenServer.cast(__MODULE__, {:set_led1, value})
  end

  def set_led2(value) do
    GenServer.cast(__MODULE__, {:set_led2, value})
  end

  def init([]) do
    {:ok, led1} = Gpio.start_link(27, :output)
    {:ok, led2} = Gpio.start_link(22, :output)
    signal_startup(led1, led2)
    {:ok, %{led1: led1, led2: led2}}
  end

  def handle_cast({:set_led1, value}, state) do
    Gpio.write(state.led1, value)
    {:noreply, state}
  end

  def handle_cast({:set_led2, value}, state) do
    Gpio.write(state.led2, value)
    {:noreply, state}
  end



  defp signal_startup(led1, led2):
    GPIO.write(led1, 1)
    :timer.sleep(500)
    GPIO.write(led1, 0)
    GPIO.write(led2, 1)
    :timer.sleep(500)
    GPIO.write(led1, 1)
    GPIO.write(led2, 0)
    :timer.sleep(500)
    GPIO.write(led1, 0)
    GPIO.write(led2, 1)
    :timer.sleep(500)
    GPIO.write(led1, 1)
    GPIO.write(led2, 1)
    :timer.sleep(250)
    GPIO.write(led1, 0)
    GPIO.write(led2, 0)
    :timer.sleep(250)
    GPIO.write(led1, 1)
    GPIO.write(led2, 1)
    :timer.sleep(250)
    GPIO.write(led1, 0)
    GPIO.write(led2, 0)
    :timer.sleep(250)
    GPIO.write(led1, 1)
    GPIO.write(led2, 1)
    :timer.sleep(250)
  end
end
