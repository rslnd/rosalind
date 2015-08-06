class Call < ActiveRecord::Base
  has_paper_trail
  validates :telephone, presence: true

  after_commit { CallRelayJob.perform_later }
end
