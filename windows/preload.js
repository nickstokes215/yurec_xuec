const { contextBridge } = require("electron");

let ver = "";
let shell = process.platform === "win32" ? "win" : "linux";
for (let i = 0; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.indexOf("--yurec-ver=") === 0) ver = a.slice(12);
  if (a.indexOf("--yurec-shell=") === 0) shell = a.slice(14);
}
contextBridge.exposeInMainWorld("__YUREC_SHELL__", { name: shell, version: ver });
