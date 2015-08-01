class Call < ActiveRecord::Base
  has_paper_trail
  validates :telephone, presence: true
end
