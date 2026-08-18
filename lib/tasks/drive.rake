namespace :drive do
  desc "Sync albums and tracks from Google Drive"
  task sync: :environment do
    puts "Syncing Google Drive..."
    DriveSyncService.sync
    puts "Done!"
  end
end
