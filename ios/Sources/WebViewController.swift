import UIKit
import WebKit

final class WebViewController: UIViewController {
    private static let pagesURL = URL(string: "https://nickstokes215.github.io/yurec_xuec/")!
    private var webView: WKWebView!
    private var statusBarStyle: UIStatusBarStyle = .lightContent

    override var preferredStatusBarStyle: UIStatusBarStyle { statusBarStyle }

    override func loadView() {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        if #available(iOS 14.0, *) {
            config.defaultWebpagePreferences.allowsContentJavaScript = true
        }

        let ver = (Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String) ?? "?"
        let flag = WKUserScript(
            source: "window.__NATIVE_SHELL__='ios';window.__SHELL_VER__='\(ver)';",
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        config.userContentController.addUserScript(flag)
        config.applicationNameForUserAgent = "Yurec/\(ver)"

        let wv = WKWebView(frame: .zero, configuration: config)
        wv.navigationDelegate = self
        wv.uiDelegate = self
        wv.allowsLinkPreview = false
        wv.allowsBackForwardNavigationGestures = true
        wv.scrollView.contentInsetAdjustmentBehavior = .never
        wv.isOpaque = false
        wv.backgroundColor = UIColor(red: 11 / 255, green: 11 / 255, blue: 12 / 255, alpha: 1)
        wv.underPageBackgroundColor = wv.backgroundColor
        webView = wv

        let root = UIView()
        root.backgroundColor = wv.backgroundColor
        root.addSubview(wv)
        wv.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            wv.topAnchor.constraint(equalTo: root.topAnchor),
            wv.bottomAnchor.constraint(equalTo: root.bottomAnchor),
            wv.leadingAnchor.constraint(equalTo: root.leadingAnchor),
            wv.trailingAnchor.constraint(equalTo: root.trailingAnchor),
        ])
        view = root
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        loadHome()
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
    }

    private func loadHome() {
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
            return
        }
        webView.load(URLRequest(url: Self.pagesURL))
    }

    @objc private func appDidBecomeActive() {
        if webView.url == nil { loadHome() }
    }
}

extension WebViewController: WKNavigationDelegate {
    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }
        let scheme = url.scheme?.lowercased() ?? ""
        if ["file", "about", "blob", "data"].contains(scheme) {
            decisionHandler(.allow)
            return
        }
        if ["http", "https", "tel", "mailto", "sms", "itms-apps"].contains(scheme) {
            decisionHandler(.cancel)
            UIApplication.shared.open(url)
            return
        }
        decisionHandler(.allow)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        loadHome()
    }
}

extension WebViewController: WKUIDelegate {
    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if let url = navigationAction.request.url {
            UIApplication.shared.open(url)
        }
        return nil
    }

    func webView(
        _ webView: WKWebView,
        runJavaScriptAlertPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping () -> Void
    ) {
        let ac = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        ac.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        present(ac, animated: true)
    }

    func webView(
        _ webView: WKWebView,
        runJavaScriptConfirmPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping (Bool) -> Void
    ) {
        let ac = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        ac.addAction(UIAlertAction(title: "Отмена", style: .cancel) { _ in completionHandler(false) })
        ac.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
        present(ac, animated: true)
    }

    func webView(
        _ webView: WKWebView,
        runJavaScriptTextInputPanelWithPrompt prompt: String,
        defaultText: String?,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping (String?) -> Void
    ) {
        let ac = UIAlertController(title: nil, message: prompt, preferredStyle: .alert)
        ac.addTextField { $0.text = defaultText }
        ac.addAction(UIAlertAction(title: "Отмена", style: .cancel) { _ in completionHandler(nil) })
        ac.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            completionHandler(ac.textFields?.first?.text)
        })
        present(ac, animated: true)
    }
}
