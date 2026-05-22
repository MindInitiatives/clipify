# Changelog

All notable changes to Clipify are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## Planned for 2.0.0 (breaking)

The next major release will introduce deliberate, documented behaviour changes
that aren't safe to ship in a minor version:

- **Real pins.** `clearHistory()` will preserve pinned items by default; an
  explicit override (e.g. `clearHistory({ includePinned: true })`) will be
  required to wipe pinned items too. Today `clearHistory()` clears everything,
  changing that default silently in a minor release could leave data behind
  when a caller expected a full wipe, so it is intentionally deferred to 2.0.0.
- `getHistory(key)` will return `undefined` (not `[]`) when a key is missing.
- `paste()` semantics and richer history item shapes will be revisited.

## [1.2.0] - 2026-05-22

A backward-compatible feature release. Everything from 1.1.x keeps working
exactly as before. This release only adds capability and fixes two issues
where the code and the documentation disagreed.

### Added

- **`search(query)`** - search history by text, key, or tag (case-insensitive),
  returning matches most-recent-first.
- **`pin(key)` / `unpin(key)`** - pin an item so it is protected from expiry.
  (Pinning does not affect `clearHistory()`, which still clears everything; a
  pin-aware `clearHistory` is planned for 2.0.0.)
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

### Notes

- The `getHistory(key)` "returns `[]` when the key is missing" quirk is
  intentionally preserved for compatibility. It will be revisited in 2.0.0.
- `clearHistory()` is unchanged from 1.1.x: it clears the entire history,
  including pinned items. Pin-aware clearing will arrive in 2.0.0.
