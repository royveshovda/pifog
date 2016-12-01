defmodule Doorpi.MqttWorker do
  use GenServer

  def start_link() do
    GenServer.start_link(__MODULE__, [])
  end

  def init([]) do
    host = 'mq01.veshovda.no'
    port = 8883
    un = "client1"
    pw = "super1"
    cacert_name = "cacert.pem"
    topic_doorpi_event = "/World/Fog/1/DoorPi/Event"
    topic_doorpi_connection = "/World/Fog/1/DoorPi/Connection"

    ssl = [cacertfile: Path.join(:code.priv_dir(:doorpi), cacert_name)]
    {:ok, pid} = :emqttc.start_link([host: host,
                                     port: port,
                                     username: un,
                                     password: pw,
                                     ssl: ssl, reconnect: {3, 120, 10},
                                     auto_resub: true])
    Process.send_after(self(), :heart_beat, 500)
    {:ok, [pid]}
  end

  def handle_info({:mqttc, pid, :connected}, state) do
    IO.puts "Connected"
    topic_doorpi_notify = "/World/Fog/1/DoorPi/Notify"
    topic_doorpi_command = "/World/Fog/1/DoorPi/Command"
    :emqttc.subscribe(pid, topic_doorpi_notify, 1)
    :emqttc.subscribe(pid, topic_doorpi_command, 1)

    {:noreply, state}
  end

  def handle_info({:publish, topic, payload}, state) do
    IO.puts "Received:"
    IO.inspect topic
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
end
