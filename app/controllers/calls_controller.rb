class CallsController < ApplicationController
  def index
    @calls = Call.all
  end

  def new
    @call = Call.new
  end

  def create
    @call = Call.new(call_params)
    if @call.save
      flash.now[:sucsess] = 'Saved Call'
      redirect_to new_call_path
    else
      flash.now[:error] = 'Could not save call'
      render action: 'new'
    end
  end

  private

  def call_params
    params.require(:call).permit(
      :last_name,
      :first_name,
      :telephone,
      :notes,
      :insurance
    )
  end
end
