# == Schema Information
#
# Table name: albums
#
#  id              :bigint           not null, primary key
#  name            :string
#  position        :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  drive_folder_id :string
#
class Album < ApplicationRecord
  has_many :tracks, -> { order(:position) }, dependent: :destroy

  default_scope { order(:position) }
end
