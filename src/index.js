const { app, BrowserWindow, Menu, Tray, globalShortcut } = require("electron");
const path = require("path");

let tray = null;
let isQuitting = false;
let mainWindow = null;

// Main Window
const createMainWindow = (height) => {
  mainWindow = new BrowserWindow({
    resizable: false,
    width: 500,
    height: height,
    x: 0,
    y: 0,
    skipTaskbar: true,
    show: false,
    maximizable: false,
    fullscreenable: false,
    paintWhenInitiallyHidden: false,
  });

  mainWindow.loadURL("https://poe.com");
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.insertCSS(
      "* { -webkit-user-select: text !important; }"
    );
  });

  mainWindow.on("close", (event) => {
    if (isQuitting) return;
    event.preventDefault();
    mainWindow.hide();
    return false;
  });

  mainWindow.on("minimize", (event) => {
    event.preventDefault();
    mainWindow.hide();
    return false;
  });

  mainWindow.on('blur', (event) => {
    event.preventDefault();
    mainWindow.hide();
    return false;
  });


  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
};

// App Events
app.on("before-quit", () => {
  isQuitting = true;
});

// functions
const toggleWindowVisibility = () => {
  mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: mainWindow.isVisible() ? "Hide" : "Show",
        type: "normal",
        click: toggleWindowVisibility,
      },
      { type: "separator" },
      { label: "Quit", type: "normal", role: "quit" },
    ])
  );
};

const createTray = () => {
  tray = new Tray(path.join(__dirname, "..", "images", "icon.png"));
  console.log(path.join(__dirname, "..", "images", "icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    { label: "show", type: "normal", click: toggleWindowVisibility },
    { type: "separator" },
    { label: "Quit", type: "normal", role: "quit" },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("Poe");
};

const registerShortCut = () => {
  const ret = globalShortcut.register(
    "CommandOrControl+Shift+g",
    toggleWindowVisibility
  );
  if (!ret) console.log("Failed to register globalShortcut:", shortcut);
};

app.dock.hide();
app.whenReady().then(() => {
  const { screen } = require("electron");
  const primaryDisplay = screen.getPrimaryDisplay();
  const height = primaryDisplay.workAreaSize.height;
  createMainWindow(height);
  createTray();
  registerShortCut();
});
