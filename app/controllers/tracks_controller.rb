require "net/http"

class TracksController < ApplicationController
  def stream
    track = Track.find(params[:id])

    token = Rails.cache.fetch("google_access_token", expires_in: 55.minutes) do
      credentials = Google::Auth::ServiceAccountCredentials.make_creds(
        json_key_io: File.open(credentials_path),
        scope: "https://www.googleapis.com/auth/drive.readonly"
      )
      credentials.fetch_access_token!["access_token"]
    end

    uri = URI("https://www.googleapis.com/drive/v3/files/#{track.drive_file_id}?alt=media")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    req = Net::HTTP::Get.new(uri)
    req["Authorization"] = "Bearer #{token}"
    req["Range"] = request.headers["Range"] if request.headers["Range"].present?

    drive_response = http.request(req)

    response.status = drive_response.code.to_i
    response.headers["Content-Type"] = drive_response["Content-Type"] || "audio/x-m4a"
    response.headers["Accept-Ranges"] = "bytes"
    response.headers["Content-Length"] = drive_response["Content-Length"] if drive_response["Content-Length"]
    response.headers["Content-Range"] = drive_response["Content-Range"] if drive_response["Content-Range"]
    response.headers["Cache-Control"] = "public, max-age=3600"

    render body: drive_response.body
  end

  private

  def credentials_path
    ENV["GOOGLE_APPLICATION_CREDENTIALS"] ||
      Rails.root.join("../../cm-bot/config/service-account.json").to_s
  end
end
