defmodule Hw.Mixfile do
  use Mix.Project

  def project do
    [app: :hw,
     version: "0.1.0",
     build_path: "../../_build",
     config_path: "../../config/config.exs",
     deps_path: "../../deps",
     lockfile: "../../mix.lock",
     elixir: "~> 1.3",
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     deps: deps]
  end

  def application do
    [applications: [
                    :logger,
                    :elixir_ale,
                    :logic],
     mod: {Hw, []}]
  end

  defp deps do
    [
      {:elixir_ale, "~> 0.5.6"},
      {:distillery, "~> 1.0"},
      {:logic, in_umbrella: true}
    ]
  end
end
