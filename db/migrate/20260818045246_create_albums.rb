class CreateAlbums < ActiveRecord::Migration[8.1]
  def change
    create_table :albums do |t|
      t.string :name
      t.string :drive_folder_id
      t.integer :position

      t.timestamps
    end
  end
end
