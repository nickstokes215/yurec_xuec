const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const VER = app.getVersion();
app.setName("Жизнь Юрца");
app.setAppUserModelId("ru.yurec.xuec");

function createWindow() {
  const icon = path.join(__dirname, "icon.png");
  const win = new BrowserWindow({
    width: 420,
    height: 860,
    minWidth: 360,
    minHeight: 640,
    backgroundColor: "#0B0B0C",
    autoHideMenuBar: true,
    icon: fs.existsSync(icon) ? icon : undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      additionalArguments: ["--yurec-ver=" + VER],
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, "www", "index.html"));

  const flag =
    "window.__NATIVE_SHELL__='win';window.__SHELL_VER__='" +
    String(VER).replace(/\\/g, "").replace(/'/g, "") +
    "';";
  win.webContents.on("dom-ready", () => {
    win.webContents.executeJavaScript(flag).catch(() => {});
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url) || /^(tel|mailto|sms):/i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (url.startsWith("file:") || url.startsWith("blob:") || url.startsWith("about:")) return;
    e.preventDefault();
    if (/^https?:/i.test(url) || /^(tel|mailto|sms):/i.test(url)) shell.openExternal(url);
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});
app.on("window-all-closed", () => app.quit());
