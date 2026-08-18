import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["audio", "row", "autoplayToggle", "toggleKnob"]

  connect() {
    this.autoplay = true
    this.currentRow = null
  }

  play(event) {
    const row = event.currentTarget.closest("[data-track-id]")
    if (!row) return

    const streamUrl = row.dataset.streamUrl
    const isCurrent = this.currentRow === row

    // If clicking the currently playing track, toggle pause/play
    if (isCurrent) {
      if (this.audioTarget.paused) {
        this.audioTarget.play()
        this._markPlaying(row)
      } else {
        this.audioTarget.pause()
        this._markPaused(row)
      }
      return
    }

    // Switch to new track
    if (this.currentRow) this._deactivateRow(this.currentRow)
    this.currentRow = row

    this.audioTarget.src = streamUrl
    this.audioTarget.play()
    this._markPlaying(row)
  }

  ended() {
    if (!this.autoplay || !this.currentRow) return

    const rows = this.rowTargets
    const currentIndex = rows.indexOf(this.currentRow)
    const nextRow = rows[currentIndex + 1]

    if (nextRow) {
      this._deactivateRow(this.currentRow)
      this.currentRow = nextRow
      this.audioTarget.src = nextRow.dataset.streamUrl
      this.audioTarget.play()
      this._markPlaying(nextRow)
      nextRow.scrollIntoView({ behavior: "smooth", block: "nearest" })
    } else {
      this._deactivateRow(this.currentRow)
      this.currentRow = null
    }
  }

  toggleAutoplay() {
    this.autoplay = !this.autoplay
    const toggle = this.autoplayToggleTarget
    const knob = this.toggleKnobTarget

    if (this.autoplay) {
      toggle.style.backgroundColor = "#537326"
      knob.classList.remove("translate-x-1")
      knob.classList.add("translate-x-5")
    } else {
      toggle.style.backgroundColor = "#d6d3d1"
      knob.classList.remove("translate-x-5")
      knob.classList.add("translate-x-1")
    }
  }

  _markPlaying(row) {
    row.style.backgroundColor = "#dcf0c8"
    const playIcon = row.querySelector("[data-player-target='playIcon']")
    const pauseIcon = row.querySelector("[data-player-target='pauseIcon']")
    if (playIcon) playIcon.classList.add("hidden")
    if (pauseIcon) pauseIcon.classList.remove("hidden")
  }

  _markPaused(row) {
    row.style.backgroundColor = "#dcf0c8"
    const playIcon = row.querySelector("[data-player-target='playIcon']")
    const pauseIcon = row.querySelector("[data-player-target='pauseIcon']")
    if (playIcon) playIcon.classList.remove("hidden")
    if (pauseIcon) pauseIcon.classList.add("hidden")
  }

  _deactivateRow(row) {
    row.style.backgroundColor = ""
    const playIcon = row.querySelector("[data-player-target='playIcon']")
    const pauseIcon = row.querySelector("[data-player-target='pauseIcon']")
    if (playIcon) playIcon.classList.remove("hidden")
    if (pauseIcon) pauseIcon.classList.add("hidden")
  }
}
