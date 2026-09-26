const { contextBridge } = require("electron");

let ver = "";
for (let i = 0; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.indexOf("--yurec-ver=") === 0) ver = a.slice(12);
}
contextBridge.exposeInMainWorld("__YUREC_SHELL__", { name: "win", version: ver });
