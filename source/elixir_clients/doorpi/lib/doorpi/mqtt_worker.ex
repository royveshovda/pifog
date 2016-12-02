defmodule Doorpi.MqttWorker do
  use GenServer
  require Logger

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
    will_payload = Poison.encode!(%{disconnected: %{device: pi_name}})
    {:ok, pid} = :emqttc.start_link([host: host,
                                     port: port,
                                     username: un,
                                     password: pw,
                                     ssl: ssl, reconnect: {3, 120, 10},
                                     auto_resub: true,
                                     will: [qos: 1, reatin: true, topic: topic_connection, payload: will_payload]])
    state = %{pid: pid,
              pi_name: pi_name,
              topic_event: topic_event,
              topic_connection: topic_connection,
              topic_command: topic_command,
              topic_notify: topic_notify}
    {:ok, state}
  end

  def handle_cast({:send_event, payload}, state) do
    :emqttc.publish(state.pid, state.topic_event, payload, [qos: 1, retain: true])
    {:noreply, state}
  end

  def handle_info({:mqttc, pid, :connected}, state) do
    send_connected(pid, state.topic_connection)
    Logger.debug("Subscribing to #{state.topic_command}")

    :emqttc.subscribe(pid, state.topic_notify, 1)
    :emqttc.subscribe(pid, state.topic_command, 1)

    {:noreply, state}
  end

  def handle_info({:mqttc, _pid, :disconnected}, state) do
    Logger.warn("Disconnected")
    {:noreply,state}
  end

  def handle_info({:publish, topic_command, payload}, state = %{topic_command: topic_command}) do
    cmd = Poison.decode!(payload)
    handle_command(cmd["command"], cmd["id"], state.pid, state.topic_event)
    {:noreply, state}
  end

  def handle_info({:publish, topic_notify, payload}, state = %{topic_notify: topic_notify}) do
    Logger.info("Received notofication: #{inspect payload}")
    {:noreply, state}
  end

  def handle_info({:publish, unknown_topic, payload}, state) do
    Logger.info("Received unknown topic(#{unknown_topic}): #{inspect payload}")
    {:noreply, state}
  end

  defp handle_command("ping", id, pid, topic_event) do
    timestamp = DateTime.utc_now |> DateTime.to_string
    msg = %{pong: %{id: id, timestamp: timestamp}}
    msg_raw = Poison.encode!(msg)
    :emqttc.publish(pid, topic_event, msg_raw)
  end

  defp handle_command(unknown_command, _id, _pid, _topic_event) do
    Logger.warn("Unknown command: #{unknown_command}")
  end

  defp send_connected(pid, topic_connection) do
    timestamp = DateTime.utc_now |> DateTime.to_string
    boot_time = "unknown" # TODO: Try to get boot time
    addresses = "TODO" # TODO: Try to get IP-addresses
    msg = %{connected: %{boot_time: boot_time, addresses: addresses, timestamp: timestamp}}
    payload = Poison.encode!(msg)
    :emqttc.publish(pid, topic_connection, payload, [qos: 1, retain: true])
  end
end
