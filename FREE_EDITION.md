# KMind Free Edition

This is the `snow212-cn/siyuan-kmind-plugin` free-maintained fork of the KMind SiYuan plugin. It is based on the upstream v2.14.1 published distribution because the public upstream repository does not contain the complete application source project.

## Policy

- All features in this fork are available without a Pro subscription, activation code, license file, or trial period.
- The client-side license-check path used by the plugin is replaced with a free status and does not call the upstream authorization service.
- The Pro purchase/activation entry is removed from the plugin's main menu.
- The internal plugin identity `kmind-plugin` is preserved for compatibility with existing data. Do not install this over a different KMind product such as KMind Zen.

## Reproducible build

The workflow downloads the fixed upstream archive declared in `upstream.json`, verifies its SHA-256, applies a narrowly scoped patch to the compiled `index.js`, runs tests and JavaScript syntax validation, and packages the result as `package.zip`. The patch aborts if an expected anchor is missing or ambiguous; it does not silently publish against an unknown upstream build.

Local reproduction requires Node.js 20+, `curl`, `unzip`, and `zip`:

```sh
npm test
KMIND_UPSTREAM_ZIP=/path/to/package.zip npm run build
npm run verify
npm run package
```

For a normal networked build, omit `KMIND_UPSTREAM_ZIP` and the pinned archive is downloaded from the upstream release URL.

## Installation

Download `package.zip` from this fork's GitHub Release, back up the workspace, and install it as the `kmind-plugin` package in SiYuan. Continue updating from this fork's releases rather than the upstream marketplace package, which has the same internal plugin identity and may overwrite the free-edition build.

## Attribution

The upstream project and its third-party dependencies retain their original notices and licenses. This fork changes distribution behavior and packaging only; it does not claim authorship of the upstream project or remove attribution.
