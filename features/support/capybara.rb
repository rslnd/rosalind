require 'capybara/webkit'
require 'capybara-screenshot/cucumber'
require 'fakeredis/rspec'

Capybara.app_host = "http://127.0.0.1:3001"
Capybara.server_port = 3001
Capybara.always_include_port = true
Capybara.default_host = '127.0.0.1'

Capybara.javascript_driver = :webkit

Capybara::Webkit.configure do |config|
  config.allow_url('127.0.0.1')
end

Thread.new do
  web_app = Rack::Builder.parse_file(File.dirname(__FILE__) + '/../config.ru').first
  passenger = Rack::Handler.get('passenger')
  passenger.run(web_app, port: 3001)
end

Thread.new do
  cable_app = Rack::Builder.parse_file(File.dirname(__FILE__) + '/../cable/config.ru').first
  passenger = Rack::Handler.get('passenger')
  passenger.run(cable_app, port: 28081)
end
