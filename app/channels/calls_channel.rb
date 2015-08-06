class CallsChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'calls'
  end
end
