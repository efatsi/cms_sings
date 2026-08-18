class DriveSyncService
  ROOT_FOLDER_ID = "1_qhewdBvZgPiVTR9LM7UHsplCElEHiL7"

  def self.sync
    new.sync
  end

  def sync
    service = build_drive_service

    folder_result = service.list_files(
      q: "'#{ROOT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder'",
      fields: "files(id, name)",
      order_by: "name"
    )

    folder_result.files.each_with_index do |folder, index|
      album = Album.find_or_initialize_by(drive_folder_id: folder.id)
      album.update!(name: folder.name, position: index)
      puts "Album: #{album.name}"

      tracks_result = service.list_files(
        q: "'#{folder.id}' in parents and mimeType != 'application/vnd.google-apps.folder'",
        fields: "files(id, name)",
        order_by: "name"
      )

      tracks_result.files.each_with_index do |file, track_index|
        track = album.tracks.find_or_initialize_by(drive_file_id: file.id)
        track.update!(name: file.name.sub(/\.m4a$/i, ""), position: track_index)
        puts "  Track: #{track.name}"
      end

      existing_ids = tracks_result.files.map(&:id)
      removed = album.tracks.where.not(drive_file_id: existing_ids).destroy_all
      puts "  Removed #{removed.size} stale tracks" if removed.any?
    end

    existing_folder_ids = folder_result.files.map(&:id)
    removed = Album.where.not(drive_folder_id: existing_folder_ids).destroy_all
    puts "Removed #{removed.size} stale albums" if removed.any?
  end

  private

  def build_drive_service
    service = Google::Apis::DriveV3::DriveService.new
    service.authorization = Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: File.open(credentials_path),
      scope: Google::Apis::DriveV3::AUTH_DRIVE_READONLY
    )
    service
  end

  def credentials_path
    ENV["GOOGLE_APPLICATION_CREDENTIALS"] ||
      Rails.root.join("../../cm-bot/config/service-account.json").to_s
  end
end
