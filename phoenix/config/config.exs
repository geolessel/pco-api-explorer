# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# Configures the endpoint
config :api_explorer, ApiExplorerWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "GNvQsUOIbq22oMM/RDzrL4zphuWPufhj/NCVmfN46SU9n6j2bm6QErbWNowqQHO1",
  render_errors: [view: ApiExplorerWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: ApiExplorer.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"

config :react_phoenix, react_stdio_path: Path.join(["assets", "node_modules", ".bin", "react-stdio"])
