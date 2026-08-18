require "net/http"

class TracksController < ApplicationController
  def stream
    track = Track.find(params[:id])

    uri = URI(track.public_url)
    drive_response = fetch_with_redirects(uri)

    self.status = drive_response.code.to_i
    response.headers["Content-Type"] = drive_response["Content-Type"] || "audio/x-m4a"
    response.headers["Accept-Ranges"] = "bytes"
    response.headers["Content-Length"] = drive_response["Content-Length"] if drive_response["Content-Length"]
    response.headers["Content-Range"] = drive_response["Content-Range"] if drive_response["Content-Range"]
    response.headers["Cache-Control"] = "public, max-age=3600"

    render body: drive_response.body
  end

  private

  def fetch_with_redirects(uri, limit = 5)
    raise "Too many redirects" if limit == 0

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == "https"

    req = Net::HTTP::Get.new(uri)
    req["Range"] = request.headers["Range"] if request.headers["Range"].present?

    resp = http.request(req)

    if resp.is_a?(Net::HTTPRedirection)
      fetch_with_redirects(URI(resp["location"]), limit - 1)
    else
      resp
    end
  end
end
