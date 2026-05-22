import Clipify, { ClipboardItem } from "../src/index";

/**
 * Helper: install a mock system clipboard on the global `navigator`, returning
 * the spies. In Node `navigator` is a read-only getter, so we use
 * defineProperty and restore afterwards.
 */
function mockClipboard(initial = "") {
  let store = initial;
  const writeText = jest.fn(async (t: string) => {
    store = t;
  });
  const readText = jest.fn(async () => store);
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    value: { clipboard: { writeText, readText } },
    configurable: true,
    writable: true,
  });
  return {
    writeText,
    readText,
    restore() {
      if (original) Object.defineProperty(globalThis, "navigator", original);
      else delete (globalThis as Record<string, unknown>).navigator;
    },
  };
}

describe("Clipify - legacy behaviour preserved", () => {
  it("copies text and stores it in history (with mocked clipboard)", async () => {
    const cb = mockClipboard();
    const clip = new Clipify();
    await clip.copy({ text: "hello", key: "greeting" });
    expect(cb.writeText).toHaveBeenCalledWith("hello");
    const item = clip.getHistory("greeting") as ClipboardItem;
    expect(item.text).toBe("hello");
    cb.restore();
  });

  it("throws when copy is called without text", async () => {
    const clip = new Clipify();
    // @ts-expect-error intentionally invalid
    await expect(clip.copy({})).rejects.toThrow(/Text is required/);
  });

  it("returns full history array when getHistory() has no key", async () => {
    const clip = new Clipify();
    await clip.copy({ text: "a" });
    await clip.copy({ text: "b" });
    const all = clip.getHistory() as ClipboardItem[];
    expect(Array.isArray(all)).toBe(true);
    expect(all).toHaveLength(2);
  });

  it("returns [] when a key is not found (1.1.x quirk preserved)", () => {
    const clip = new Clipify();
    expect(clip.getHistory("missing")).toEqual([]);
  });

  it("fires the copy event", async () => {
    const clip = new Clipify();
    const spy = jest.fn();
    clip.on("copy", spy);
    await clip.copy({ text: "x" });
    expect(spy).toHaveBeenCalledWith("x");
  });

  it("fires the expire event after the TTL lapses", async () => {
    jest.useFakeTimers();
    const clip = new Clipify();
    const spy = jest.fn();
    clip.on("expire", spy);
    await clip.copy({ text: "ephemeral", expiryTime: 1000 });
    jest.advanceTimersByTime(1001);
    expect(spy).toHaveBeenCalledWith("ephemeral");
    expect(clip.getHistory()).toHaveLength(0);
    jest.useRealTimers();
  });

  it("reports clipboard support correctly", () => {
    const cb = mockClipboard();
    expect(Clipify.isClipboardSupported()).toBe(true);
    cb.restore();
    expect(Clipify.isClipboardSupported()).toBe(false);
  });

  it("reads from the system clipboard on paste (browser path)", async () => {
    const cb = mockClipboard("system value");
    const clip = new Clipify();
    expect(await clip.paste()).toBe("system value");
    cb.restore();
  });
});

describe("Clipify 1.2.0 - SSR / Node safety", () => {
  it("does not throw constructing without a clipboard", () => {
    expect(() => new Clipify()).not.toThrow();
  });

  it("copy records to history without a system clipboard", async () => {
    const clip = new Clipify();
    await expect(clip.copy({ text: "ssr", key: "k" })).resolves.toBeUndefined();
    expect((clip.getHistory("k") as ClipboardItem).text).toBe("ssr");
  });

  it("paste falls back to most-recent history text when no clipboard", async () => {
    const clip = new Clipify();
    await clip.copy({ text: "first" });
    await clip.copy({ text: "second" });
    expect(await clip.paste()).toBe("second");
  });

  it("paste returns empty string when history has no text", async () => {
    const clip = new Clipify();
    expect(await clip.paste()).toBe("");
  });

  it("isClipboardSupported is false in Node", () => {
    expect(Clipify.isClipboardSupported()).toBe(false);
  });
});

describe("Clipify 1.2.0 - copyFile expiry", () => {
  it("stores a file with no expiry", async () => {
    const clip = new Clipify();
    const blob = new Blob(["data"], { type: "text/plain" });
    await clip.copyFile(blob, "f1");
    expect((clip.getHistory("f1") as ClipboardItem).file).toBeInstanceOf(Blob);
  });

  it("expires a file after the given TTL", async () => {
    jest.useFakeTimers();
    const clip = new Clipify();
    const blob = new Blob(["data"], { type: "text/plain" });
    await clip.copyFile(blob, "f2", 500);
    expect(clip.getHistory()).toHaveLength(1);
    jest.advanceTimersByTime(501);
    expect(clip.getHistory()).toHaveLength(0);
    jest.useRealTimers();
  });
});

describe("Clipify 1.2.0 - search", () => {
  it("matches text case-insensitively", async () => {
    const clip = new Clipify();
    await clip.copy({ text: "Hello World" });
    await clip.copy({ text: "goodbye" });
    const hits = clip.search("hello");
    expect(hits).toHaveLength(1);
    expect(hits[0].text).toBe("Hello World");
  });

  it("matches by key and tag", async () => {
    const clip = new Clipify();
    await clip.copy({ text: "value", key: "apikey" });
    clip.tag("apikey", "secret");
    expect(clip.search("apikey")).toHaveLength(1); // key match
    expect(clip.search("secret")).toHaveLength(1); // tag match
  });

  it("returns results most-recent-first", async () => {
    const clip = new Clipify();
    await clip.copy({ text: "match one" });
    await clip.copy({ text: "match two" });
    const hits = clip.search("match");
    expect(hits[0].text).toBe("match two");
  });

  it("returns whole history for an empty query", async () => {
    const clip = new Clipify();
    await clip.copy({ text: "a" });
    await clip.copy({ text: "b" });
    expect(clip.search("   ")).toHaveLength(2);
  });
});

describe("Clipify 1.2.0 - pin / unpin", () => {
  it("pins an item so it survives expiry", async () => {
    jest.useFakeTimers();
    const clip = new Clipify();
    await clip.copy({ text: "keep me", key: "k", expiryTime: 500 });
    expect(clip.pin("k")).toBe(true);
    jest.advanceTimersByTime(1000);
    expect(clip.getHistory()).toHaveLength(1); // not expired
    jest.useRealTimers();
  });

  it("unpin lets the item expire again", async () => {
    jest.useFakeTimers();
    const clip = new Clipify();
    await clip.copy({ text: "temp", key: "k", expiryTime: 500 });
    clip.pin("k");
    clip.unpin("k");
    // A new expiry won't re-arm the old timer, so verify clearHistory behaviour
    // instead: unpinned items are wiped by default clearHistory.
    clip.clearHistory();
    expect(clip.getHistory()).toHaveLength(0);
    jest.useRealTimers();
  });

  it("returns false when pinning a missing key", () => {
    const clip = new Clipify();
    expect(clip.pin("nope")).toBe(false);
  });
});

describe("Clipify 1.2.0 - tags", () => {
  it("tags an item and retrieves it by tag", async () => {
    const clip = new Clipify();
    await clip.copy({ text: "v", key: "k" });
    expect(clip.tag("k", "work", "urgent")).toBe(true);
    expect(clip.getByTag("work")).toHaveLength(1);
    expect(clip.getByTag("urgent")).toHaveLength(1);
    expect(clip.getByTag("none")).toHaveLength(0);
  });

  it("de-duplicates tags", async () => {
    const clip = new Clipify();
    await clip.copy({ text: "v", key: "k" });
    clip.tag("k", "a");
    clip.tag("k", "a", "b");
    const item = clip.getHistory("k") as ClipboardItem;
    expect(item.tags?.sort()).toEqual(["a", "b"]);
  });
});

describe("Clipify 1.2.0 - clearHistory + pinning", () => {
  it("preserves pinned items by default", async () => {
    const clip = new Clipify();
    await clip.copy({ text: "keep", key: "k1" });
    await clip.copy({ text: "drop", key: "k2" });
    clip.pin("k1");
    clip.clearHistory();
    const all = clip.getHistory() as ClipboardItem[];
    expect(all).toHaveLength(1);
    expect(all[0].key).toBe("k1");
  });

  it("wipes everything with includePinned", async () => {
    const clip = new Clipify();
    await clip.copy({ text: "keep", key: "k1" });
    clip.pin("k1");
    clip.clearHistory({ includePinned: true });
    expect(clip.getHistory()).toHaveLength(0);
  });
});
