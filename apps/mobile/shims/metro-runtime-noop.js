'use strict';
// No-op replacement for @expo/metro-runtime on native (iOS/Android).
//
// WHY THIS EXISTS:
// @expo/metro-runtime@4.0.1 sets up JS-side HMR / WebSocket connections to
// the Metro dev server. In RN 0.81 / Metro 0.83, its internal use of require()
// on ESM default-export modules (getDevServer, WebSocket) fails with
// "not a function (it is Object)" / "constructor is not callable" due to a
// Metro 0.83 ESM-CJS interop change.
//
// In Expo Go, this JS setup is unnecessary: the Expo Go native shell already
// provides hot-reload and dev-server connections. Skipping the JS setup has
// no effect on app functionality — only the JS-driven fast-refresh overlay
// is absent (Expo Go's native equivalent still works).
//
// RESTORE WHEN: @expo/metro-runtime is updated to fix the require() interop
// with Metro 0.83 / RN 0.81, or when building a standalone (non-Expo-Go) app.
