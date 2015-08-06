class CallRelayJob < ApplicationJob
  def perform
    @calls = Call.all
    ActionCable.server.broadcast('calls', CallsController.render(:index,
      locals: { :@calls => @calls }))
  end
end
