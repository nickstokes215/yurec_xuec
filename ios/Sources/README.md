# ios/Sources/

- `AppDelegate.swift` — одно окно, корень `WebViewController`.
- `WebViewController.swift` — WKWebView, флаг `__NATIVE_SHELL__='ios'`. Внешние http/tel/mailto уходят в систему. `underPageBackgroundColor` только с iOS 15 (`#available`). Deployment 14.0.

Не тащи сюда UIKit-экраны двора. Двор — HTML.
