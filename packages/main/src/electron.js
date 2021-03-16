const { app, BrowserWindow, globalShortcut, ipcMain, screen, dialog, shell } = require('electron');
const path = require('path');

// TODO: Create a shadow around the minified window to make it easer to spot.

/*
 * TODO: When a window frame is created it does not register when a mouse leaves the window
 * making some :hover css styles not return back to normal when the mouse leaves the window.
 *
 * This is fixed when calling hide()/ show()/ hide()/ show() on the target window.
 * The fixed the window frame will block mouse events 4 pixels from the edge of the window.
 *
 * This is probably a bug.
 */
const WINDOW_MIN_WIDTH = 240;
const WINDOW_MIN_HEIGHT = 480;
const isDev = require('electron-is-dev');
const url = require('url');

let mini_win = null;
let maxi_win = null

const defaultBrowserSettings = {
	width: WINDOW_MIN_WIDTH,
	height: WINDOW_MIN_HEIGHT,
	title: "Bob Rust",
	show: false,
	resizable: false,
	frame: false,
	maximizable: false,
}


app.commandLine.appendSwitch('disable-pinch');

function createWindow() {
	const win = new BrowserWindow({
		...defaultBrowserSettings,
		minWidth: WINDOW_MIN_WIDTH,
		minHeight: WINDOW_MIN_HEIGHT,
		backgroundColor: '#383a3f',
		webPreferences: {
			backgroundThrottling: true,
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			enableRemoteModule: false,
			nodeIntegration: false,
			nativeWindowOpen: true
			/* devTools: false, */
		}
	});

	// Was app/renderer/public/index.html
	const mainUrl = pageLocation();

	win.loadURL(mainUrl);
	win.setAlwaysOnTop(true, "screen-saver", 1);
	if(isDev) win.openDevTools({ mode: 'detach' });
	mini_win = win;

	win.on('ready-to-show', () => {
		win.show();
		// To stop touch screens zooming like a browser
		win.webContents.setZoomFactor(1);
		win.webContents.setVisualZoomLevelLimits(1, 1);
	});

	{
		const win2 = new BrowserWindow({
			...defaultBrowserSettings,
			transparent: true,
			webPreferences: {
				backgroundThrottling: true,
				preload: path.join(__dirname, 'preload.js'),
				contextIsolation: true,
				enableRemoteModule: false,
				nodeIntegration: false,
				nativeWindowOpen: true
				/* devTools: false, */
			}
		});

		// Was app/renderer/public/fullscreen_index.html
		const secondWindow = pageLocation('maximized');

		win2.loadURL(secondWindow);
		win2.setAlwaysOnTop(true, "screen-saver", 1);
		if(isDev) win2.openDevTools({ mode: 'detach' });
		maxi_win = win2;
	}

	// Disable reloading
	/*
	win.on('focus', (event) => {
		globalShortcut.register('CommandOrControl+R', () => {});
		globalShortcut.register('CommandOrControl+Shift+R', () => {});
		globalShortcut.register('F5', () => {});
	});

	win.on('blur', (event) => {
		globalShortcut.unregister('CommandOrControl+R');
		globalShortcut.unregister('CommandOrControl+Shift+R');
		globalShortcut.unregister('F5');
	});
	*/

	globalShortcut.register('F10', () => {
		mini_win.focus();
		maxi_win.focus();
	});

	setupCommonHandlers(mini_win);
	setupCommonHandlers(maxi_win);
}

function pageLocation(location = '') {
	return isDev ? `http://localhost:3000/#/${location}` : url.format({
		pathname: path.join(__dirname, `../renderer/index.html`),
		hash: `/${location}`,
		protocol: 'file:',
		slashes: true
	});
}

function setupCommonHandlers(win) {
	win.webContents.setWindowOpenHandler(({ url }) => {
		if(url.startsWith('https://github.com/')) {
			shell.openExternal(url);
		}

		return {action: 'deny'};
	});

	win.webContents.on('did-create-window', (childWindow) => {
		childWindow.webContents('will-navigate', (e) => {
			e.preventDefault();
		});
	});

	win.on('closed', () => {
		app.quit();
	});
}

app.whenReady().then(createWindow);


// Probably not activated because of the hiding behavior but well keep it in case.
app.on('window-all-closed', () => {
	if(process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if(BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// icpMessages
ipcMain.handle('closeBrowserWindow', async (event) => {
	try {
		mini_win.close();
	} catch(e) {
		console.warn(e);
	}

	try {
		maxi_win.close();
	} catch(e) {
		console.warn(e);
	}
});

ipcMain.handle('maximizeBrowserWindow', async (event) => {
	let size = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;
	mini_win.hide();
	maxi_win.show();
	maxi_win.setBounds(size);
	maxi_win.focusOnWebView();
});

ipcMain.handle('minimizeBrowserWindow', async (event) => {
	maxi_win.hide();
	mini_win.show();
	mini_win.focusOnWebView();

	// TODO: Reposition the mini window to the center of the screen.
});

ipcMain.handle('tryMoveWindowToCursorMonitor', async (event, enable) => {
	let bounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;
	let win_bounds = maxi_win.getBounds();

	if(win_bounds.x != bounds.x || win_bounds.y != bounds.y
	|| win_bounds.width != bounds.width || win_bounds.height != bounds.height) {
		maxi_win.setBounds(bounds);
	}
});

ipcMain.handle('openTextureDialog', async (event, enable) => {
	let win = BrowserWindow.fromId(event.sender.id);
	if(win) {
		return dialog.showOpenDialog(win, {
			properties: [ 'openFile' ],
			filters: [
				{ name: 'Borst Files', extensions: [ 'borst' ] },
				{ name: 'Images', extensions: [ 'jpg', 'jpeg', 'png', 'gif' ] },
				{ name: 'All Files', extensions: [ '*' ] },
			],
		});
	}
});

ipcMain.handle('setIgnoreMouseEvents', async (event, enable) => {
	let win = BrowserWindow.fromId(event.sender.id);
	if(win) {
		win.setIgnoreMouseEvents(enable);
	}
});

ipcMain.handle('openBrowserLink', async (event, href) => {
	shell.openExternal(href);
});

// =======================

let robot = require('robotjs');

ipcMain.handle('robot_mouseClick', async (event) => {
	robot.mouseClick();
});

ipcMain.handle('robot_mouseMove', async (event, x, y) => {
	robot.moveMouse(x, y);
});

ipcMain.handle('robot_mouseDelay', async (event, delay) => {
	robot.setMouseDelay(delay);
});

ipcMain.handle('robot_checkMouse', async (event, x, y) => {
	let pos = robot.getMousePos();
	return pos.x == Math.trunc(x) && pos.y == Math.trunc(y);
});

ipcMain.handle('robot_screenshot', async (event, x, y, width, height) => {
	let result = robot.screen.capture(x, y, width, height);

	return {
		width: result.width,
		height: result.height,
		bytePerPixel: result.bytesPerPixel,
		image: result.image,
	};
});

if(!isDev) {
	app.on('browser-window-focus', function () {
		globalShortcut.register("CommandOrControl+R", () => {
		});
	});

	app.on('browser-window-blur', function () {
		globalShortcut.unregister('CommandOrControl+R');
	});
}
