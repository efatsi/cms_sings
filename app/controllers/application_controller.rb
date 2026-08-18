class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  before_action :allow_iframe_embedding
  before_action :handle_embed_mode

  private

  def allow_iframe_embedding
    response.headers.delete("X-Frame-Options")
  end

  def handle_embed_mode
    if params[:embed] == "true"
      cookies[:embed] = { value: "true", expires: 1.year.from_now }
    end
  end

  helper_method def embed_mode?
    params[:embed] == "true" || cookies[:embed] == "true"
  end
end
