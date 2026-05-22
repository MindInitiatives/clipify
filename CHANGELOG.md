# Changelog

All notable changes to Clipify are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [1.2.0] - 2026-05-22

A backward-compatible feature release. Everything from 1.1.x keeps working
exactly as before. This release only adds capability and fixes two issues
where the code and the documentation disagreed.

### Added

- **`search(query)`** - search history by text, key, or tag (case-insensitive),
  returning matches most-recent-first.
- **`pin(key)` / `unpin(key)`** - pin an item so it survives expiry and is kept
  by `clearHistory()`.
- **`tag(key, ...tags)` / `getByTag(tag)`** - attach freeform tags to items and
  retrieve them by tag. Tags are de-duplicated.
- `ClipboardItem` now optionally carries `pinned` and `tags` fields.
- The package now exports its types (`ClipboardItem`, `ClipboardOptions`,
  `ClipboardEventListener`) for consumers.

### Fixed

- **SSR / Node safety**: the library no longer assumes `navigator` exists.
  Previously `copy`, `paste`, and `isClipboardSupported` would throw (or crash)
  when imported in Node or server-side rendering. Now, when there is no system
  clipboard, `copy` records to history only, `paste` falls back to the most
  recent history text, and `isClipboardSupported()` returns `false`.
- **`copyFile` expiry**: `copyFile` now accepts the optional `expiryTime`
  argument that the README already documented (`copyFile(blob, key, 10000)`).
  Existing two-argument calls are unaffected.
- `copy` no longer throws when the system clipboard write fails (e.g. permission
  or focus errors); the item is still recorded in history and the `copy` event
  still fires.
- Expiry timers are now `unref`'d so they don't keep a Node process alive.

### Changed (minor, non-breaking in practice)

- **`clearHistory()` now preserves pinned items by default.** This is the only
  sensible behaviour once pinning exists, as a pin that `clearHistory` wipes
  wouldn't be a pin. To restore the old "wipe everything" behaviour, call
  `clearHistory({ includePinned: true })`. Code that never pins anything sees no
  difference.

### Notes

- The `getHistory(key)` "returns `[]` when the key is missing" quirk is
  intentionally preserved for compatibility. It will be revisited in 2.0.0.
