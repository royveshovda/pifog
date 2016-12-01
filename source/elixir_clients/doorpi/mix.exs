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
     applications: [:logger]]
  end

  def deps do
    [{:nerves, "~> 0.3.0"}]
  end

  def system(target) do
    [
      {:"nerves_system_#{target}", ">= 0.0.0"},
      {:poison, "~> 3.0"},
      {:emqttc, git: "https://github.com/emqtt/emqttc.git"},
      {:getopt, git: "https://github.com/jcomellas/getopt.git", override: true},
      {:elixir_ale, "~> 0.5.6"}
    ]
  end

  def aliases do
    ["deps.precompile": ["nerves.precompile", "deps.precompile"],
     "deps.loadpaths":  ["deps.loadpaths", "nerves.loadpaths"]]
  end

end
