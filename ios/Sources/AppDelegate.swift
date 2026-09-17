import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let win = UIWindow(frame: UIScreen.main.bounds)
        win.backgroundColor = UIColor(red: 11 / 255, green: 11 / 255, blue: 12 / 255, alpha: 1)
        win.rootViewController = WebViewController()
        win.makeKeyAndVisible()
        window = win
        return true
    }
}
