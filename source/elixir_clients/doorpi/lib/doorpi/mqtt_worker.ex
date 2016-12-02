defmodule Doorpi.MqttWorker do
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def send_door_state(door1, door2) do
    timestamp = DateTime.utc_now |> DateTime.to_string
    msg = %{state: %{door1: door1, door2: door2, timestamp: timestamp}}
    msg_raw = Poison.encode!(msg)
    GenServer.cast(__MODULE__, {:send_event, msg_raw})
  end

  def init(%{pi_name: pi_name, host: host, port: port, username: un, passeord: pw, cacert: cacert_name}) do
    topic_event = "/World/Fog/1/#{pi_name}/Event"
    topic_connection = "/World/Fog/1/#{pi_name}/Connection"
    topic_command = "/World/Fog/1/#{pi_name}/Command"
    topic_notify = "/World/Fog/1/#{pi_name}/Notify"

    ssl = [cacertfile: Path.join(:code.priv_dir(:doorpi), cacert_name)]
    {:ok, pid} = :emqttc.start_link([host: host,
                                     port: port,
                                     username: un,
                                     password: pw,
                                     ssl: ssl, reconnect: {3, 120, 10},
                                     auto_resub: true])
    #Process.send_after(self(), :heart_beat, 500)
    state = %{pid: pid,
              pi_name: pi_name,
              topic_event: topic_event,
              topic_connection: topic_connection,
              topic_command: topic_command,
              topic_notify: topic_notify}

    # TODO: Last will
    {:ok, state}
  end

  def handle_cast({:send_event, payload}, state) do
    IO.puts "Will publish"
    :emqttc.publish(state.pid, state.topic_event, payload, [qos: 1, retain: true])
    {:noreply, state}
  end

  def handle_info({:mqttc, pid, :connected}, state) do
    IO.puts "Connected"

    #TODO: Send connected
    IO.puts "Subscribint to #{state.topic_command}"

    :emqttc.subscribe(pid, state.topic_notify, 1)
    :emqttc.subscribe(pid, state.topic_command, 1)

    {:noreply, state}
  end

  def handle_info({:mqttc, _pid, :disconnected}, state) do
    IO.puts "Disconnected"
    {:noreply,state}
  end

  def handle_info({:publish, topic_command, payload}, state = %{topic_command: topic_command}) do
    cmd = Poison.decode!(payload)
    handle_command(cmd["command"], cmd["id"], state.pid, state.topic_event)
    {:noreply, state}
  end

  def handle_info({:publish, topic_notify, payload}, state = %{topic_notify: topic_notify}) do
    IO.puts "Received notification:"
    IO.inspect payload
    {:noreply, state}
  end

  def handle_info({:publish, unknown_topic, payload}, state) do
    IO.puts "Received:"
    IO.inspect unknown_topic
    IO.inspect payload
    {:noreply, state}
  end

  def handle_info(:heart_beat, [pid]) do
    timestamp = DateTime.utc_now |> DateTime.to_string
    msg = %{state: %{door1: "open", door2: "closed", timestamp: timestamp}}
    msg_raw = Poison.encode!(msg)
    :emqttc.publish(pid, "/World/Fog/1/DoorPi/Event", msg_raw, [qos: 1, retain: true])
    Process.send_after(self(), :heart_beat, 5000)
    {:noreply, [pid]}
  end

  defp handle_command("ping", id, pid, topic_event) do

    timestamp = DateTime.utc_now |> DateTime.to_string
    msg = %{pong: %{id: id, timestamp: timestamp}}
    msg_raw = Poison.encode!(msg)
    IO.puts msg_raw
    IO.puts topic_event
    :emqttc.publish(pid, topic_event, msg_raw)
  end

  defp handle_command(unknown_command, _id, _pid, _topic_event) do
    IO.puts "Unknown command: #{unknown_command}"
  end
end
