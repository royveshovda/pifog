defmodule Hw.GpioWorker do
  use GenServer

  @pin_door1 17
  @pin_door2 18

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

    {:ok, door1} = Gpio.start_link(@pin_door1, :input)
    {:ok, door2} = Gpio.start_link(@pin_door2, :input)
    :ok = Gpio.set_int(door1, :both)
    :ok = Gpio.set_int(door2, :both)

    {:ok, %{led1: led1, led2: led2, door1: :open, door2: :open}}
  end

  def handle_cast({:set_led1, value}, state) do
    Gpio.write(state.led1, value)
    {:noreply, state}
  end

  def handle_cast({:set_led2, value}, state) do
    Gpio.write(state.led2, value)
    {:noreply, state}
  end

  def handle_info({:gpio_interrupt, @pin_door1, :falling}, state) do
    new_state = %{state | door1: :open}
    set_door_state(new_state.door1, new_state.door2, new_state.led1, new_state.led2)
    Doorpi.MqttWorker.send_door_state(new_state.door1, new_state.door2)
    {:noreply, new_state}
  end

  def handle_info({:gpio_interrupt, @pin_door1, :rising}, state) do
    new_state = %{state | door1: :closed}
    set_door_state(new_state.door1, new_state.door2, new_state.led1, new_state.led2)
    Doorpi.MqttWorker.send_door_state(new_state.door1, new_state.door2)
    {:noreply, new_state}
  end

  def handle_info({:gpio_interrupt, @pin_door2, :falling}, state) do
    new_state = %{state | door2: :open}
    set_door_state(new_state.door1, new_state.door2, new_state.led1, new_state.led2)
    Doorpi.MqttWorker.send_door_state(new_state.door1, new_state.door2)
    {:noreply, new_state}
  end

  def handle_info({:gpio_interrupt, @pin_door2, :rising}, state) do
    new_state = %{state | door2: :closed}
    set_door_state(new_state.door1, new_state.door2, new_state.led1, new_state.led2)
    Doorpi.MqttWorker.send_door_state(new_state.door1, new_state.door2)
    {:noreply, new_state}
  end

  defp set_door_state(:open, :open, led1, led2) do
    Gpio.write(led1, 0)
    Gpio.write(led2, 0)
  end

  defp set_door_state(:open, :closed, led1, led2) do
    Gpio.write(led1, 0)
    Gpio.write(led2, 1)
  end

  defp set_door_state(:closed, :open, led1, led2) do
    Gpio.write(led1, 1)
    Gpio.write(led2, 0)
  end

  defp set_door_state(:closed, :closed, led1, led2) do
    Gpio.write(led1, 1)
    Gpio.write(led2, 1)
  end

  defp signal_startup(led1, led2) do
    Gpio.write(led1, 1)
    :timer.sleep(500)
    Gpio.write(led1, 0)
    Gpio.write(led2, 1)
    :timer.sleep(500)
    Gpio.write(led1, 1)
    Gpio.write(led2, 0)
    :timer.sleep(500)
    Gpio.write(led1, 0)
    Gpio.write(led2, 1)
    :timer.sleep(500)
    Gpio.write(led1, 1)
    Gpio.write(led2, 1)
    :timer.sleep(250)
    Gpio.write(led1, 0)
    Gpio.write(led2, 0)
    :timer.sleep(250)
    Gpio.write(led1, 1)
    Gpio.write(led2, 1)
    :timer.sleep(250)
    Gpio.write(led1, 0)
    Gpio.write(led2, 0)
    :timer.sleep(250)
    Gpio.write(led1, 1)
    Gpio.write(led2, 1)
    :timer.sleep(250)
  end
end
