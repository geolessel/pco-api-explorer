defmodule ApiExplorerWeb.PageController do
  use ApiExplorerWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html",
      application_id: Application.get_env(:api_explorer, :application_id),
      secret: Application.get_env(:api_explorer, :secret)
      )
  end
end
