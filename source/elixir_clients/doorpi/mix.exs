defmodule Doorpi.Mixfile do
  use Mix.Project

  @target System.get_env("NERVES_TARGET") || "rpi"

  def project do
    [app: :doorpi,
     version: "0.0.1",
     target: @target,
     archives: [nerves_bootstrap: "~> 0.1.4"],
     deps_path: "deps/#{@target}",
     build_path: "_build/#{@target}",
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     aliases: aliases,
     deps: deps ++ system(@target)]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [mod: {Doorpi, []},
     applications: [
       :logger,
       :nerves_interim_wifi,
       :ssl,
       :poison,
       :emqttc,
       :elixir_ale,
       :nerves_ntp]]
  end

  def deps do
    [
      {:nerves, "~> 0.3.4"},
      {:poison, "~> 3.0"},
      {:emqttc, git: "https://github.com/emqtt/emqttc.git"},
      {:getopt, "~> 0.8.2", override: true},
      {:elixir_ale, "~> 0.5.6"},
      {:relx, "~> 3.21", override: true},
      {:erlware_commons, "~> 0.21.0", override: true},
      {:nerves_interim_wifi, "~> 0.1.0"},
      {:nerves_ntp, "~> 0.1"},
    ]
  end

  def system(target) do
    [
      {:"nerves_system_#{target}", ">= 0.0.0"}
    ]
  end

  def aliases do
    ["deps.precompile": ["nerves.precompile", "deps.precompile"],
     "deps.loadpaths":  ["deps.loadpaths", "nerves.loadpaths"]]
  end

end
