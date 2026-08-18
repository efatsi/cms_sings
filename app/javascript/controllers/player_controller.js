import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "audio", "row", "autoplayToggle", "toggleKnob",
    "nowPlaying", "nowPlayingTitle",
    "progressFill", "progressBar", "currentTime", "durationDisplay",
    "nowPlayingPlayIcon", "nowPlayingPauseIcon"
  ]

  connect() {
    this.autoplay = true
    this.currentRow = null
  }

  play(event) {
    const row = event.currentTarget.closest("[data-track-id]")
    if (!row) return

    if (this.currentRow === row) {
      if (this.audioTarget.paused) {
        this.audioTarget.play()
        this._markPlaying(row)
      } else {
        this.audioTarget.pause()
        this._markPaused(row)
      }
      return
    }

    if (this.currentRow) this._deactivateRow(this.currentRow)
    this.currentRow = row
    this.audioTarget.src = row.dataset.streamUrl
    this.audioTarget.play()
    this._markPlaying(row)
  }

  ended() {
    if (!this.autoplay || !this.currentRow) return
    const next = this._nextRow()
    if (next) {
      this._switchTo(next)
    } else {
      this._deactivateRow(this.currentRow)
      this.currentRow = null
      this._setNowPlayingIcons(false)
    }
  }

  togglePlayPause() {
    if (!this.currentRow) return
    if (this.audioTarget.paused) {
      this.audioTarget.play()
      this._markPlaying(this.currentRow)
    } else {
      this.audioTarget.pause()
      this._markPaused(this.currentRow)
    }
  }

  previous() {
    if (!this.currentRow) return
    if (this.audioTarget.currentTime > 3) {
      this.audioTarget.currentTime = 0
      return
    }
    const rows = this.rowTargets
    const prev = rows[rows.indexOf(this.currentRow) - 1]
    if (prev) {
      this._switchTo(prev)
    } else {
      this.audioTarget.currentTime = 0
    }
  }

  next() {
    const next = this._nextRow()
    if (next) this._switchTo(next)
  }

  updateProgress() {
    const audio = this.audioTarget
    if (!audio.duration) return
    const pct = (audio.currentTime / audio.duration) * 100
    this.progressFillTarget.style.width = pct + "%"
    this.progressBarTarget.value = pct
    this.currentTimeTarget.textContent = this._formatTime(audio.currentTime)
  }

  updateDuration() {
    this.durationDisplayTarget.textContent = this._formatTime(this.audioTarget.duration)
  }

  seek() {
    const pct = parseFloat(this.progressBarTarget.value)
    const audio = this.audioTarget
    if (audio.duration) {
      audio.currentTime = (pct / 100) * audio.duration
      this.progressFillTarget.style.width = pct + "%"
    }
  }

  toggleAutoplay() {
    this.autoplay = !this.autoplay
    const toggle = this.autoplayToggleTarget
    const knob = this.toggleKnobTarget
    if (this.autoplay) {
      toggle.style.backgroundColor = "#537326"
      knob.classList.replace("translate-x-1", "translate-x-5")
    } else {
      toggle.style.backgroundColor = "#d6d3d1"
      knob.classList.replace("translate-x-5", "translate-x-1")
    }
  }

  // — private —

  _switchTo(row) {
    if (this.currentRow) this._deactivateRow(this.currentRow)
    this.currentRow = row
    this.audioTarget.src = row.dataset.streamUrl
    this.audioTarget.play()
    this._markPlaying(row)
    row.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  _nextRow() {
    if (!this.currentRow) return null
    const rows = this.rowTargets
    return rows[rows.indexOf(this.currentRow) + 1] || null
  }

  _markPlaying(row) {
    row.style.backgroundColor = "#dcf0c8"
    this._rowIcons(row, { play: true, pause: false })
    this._setNowPlayingIcons(true)
    this._updateNowPlayingTitle(row)
    this.nowPlayingTarget.classList.remove("hidden")
  }

  _markPaused(row) {
    row.style.backgroundColor = "#dcf0c8"
    this._rowIcons(row, { play: false, pause: true, playForced: true })
    this._setNowPlayingIcons(false)
  }

  _deactivateRow(row) {
    row.style.backgroundColor = ""
    this._rowIcons(row, { play: false, pause: true })
  }

  _rowIcons(row, { play, pause, playForced = false }) {
    const playIcon = row.querySelector("[data-player-target='playIcon']")
    const pauseIcon = row.querySelector("[data-player-target='pauseIcon']")
    if (playIcon) {
      playIcon.classList.toggle("hidden", play)
      playIcon.classList.toggle("!opacity-100", playForced)
    }
    if (pauseIcon) pauseIcon.classList.toggle("hidden", pause)
  }

  _setNowPlayingIcons(playing) {
    this.nowPlayingPlayIconTarget.classList.toggle("hidden", playing)
    this.nowPlayingPauseIconTarget.classList.toggle("hidden", !playing)
  }

  _updateNowPlayingTitle(row) {
    this.nowPlayingTitleTarget.textContent = row.dataset.trackName || "—"
  }

  _formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00"
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }
}
