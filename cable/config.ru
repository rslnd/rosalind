require ::File.expand_path('../../config/environment',  __FILE__)
Rails.application.eager_load!

require 'action_cable/process/logging'

PhusionPassenger.advertised_concurrency_level = 0 if defined?(PhusionPassenger)

run ActionCable.server
