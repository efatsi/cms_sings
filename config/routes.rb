Rails.application.routes.draw do
  root "albums#index"
  resources :albums, only: [:index, :show]
  get "/tracks/:id/stream", to: "tracks#stream", as: :stream_track

  get "up" => "rails/health#show", as: :rails_health_check
end
