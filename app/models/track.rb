# == Schema Information
#
# Table name: tracks
#
#  id            :bigint           not null, primary key
#  name          :string
#  position      :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  album_id      :bigint           not null
#  drive_file_id :string
#
# Indexes
#
#  index_tracks_on_album_id  (album_id)
#
# Foreign Keys
#
#  fk_rails_...  (album_id => albums.id)
#
class Track < ApplicationRecord
  belongs_to :album

  def display_name
    name.sub(/^\d+\s+/, "").sub(/\.m4a$/i, "")
  end
end
