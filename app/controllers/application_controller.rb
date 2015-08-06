class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :set_gettext_locale, :set_websocket_url

  private

  def set_websocket_url
    puts "-----------------> #{request.port}"
    gon.websocket_url = 'ws://127.0.0.1:28080' if Rails.env.development?
    gon.websocket_url = 'ws://127.0.0.1:28081' if Rails.env.test?
  end
end
