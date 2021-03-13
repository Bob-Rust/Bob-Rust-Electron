const { app, BrowserWindow, globalShortcut, ipcMain, screen, dialog, shell } = require('electron');
const path = require('path');

// TODO: Create a shadow around the minified window to make it easer to spot.
const WINDOW_MIN_WIDTH = 240; //652
const WINDOW_MIN_HEIGHT = 480; // 456
const isDev = require('electron-is-dev');

let mini_win = null;
let maxi_win = null;


app.commandLine.appendSwitch('disable-pinch');

function createWindow() {
	const win = new BrowserWindow({
		width: WINDOW_MIN_WIDTH,
		height: WINDOW_MIN_HEIGHT,
		minWidth: WINDOW_MIN_WIDTH,
		minHeight: WINDOW_MIN_HEIGHT,
		frame: false,
		title: "Bob Rust",
		transparent: false,
		maximizable: false,
		backgroundColor: '#383a3f',
		resizable: false,
		show: false,
		webPreferences: {
			backgroundThrottling: false,
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			enableRemoteModule: false,
			nodeIntegration: false,
			nativeWindowOpen: true
			/* devTools: false, */
		}
	})

	// Was app/renderer/public/index.html
	const mainUrl = isDev ? "http://localhost:3000/" : url.format({
		pathname: path.join(__dirname, '/../../renderer/build/index.html'),
		protocol: 'file:',
		slashes: true
	});

	win.loadURL(mainUrl);
	win.setAlwaysOnTop(true, "screen-saver", 1);
	if(isDev) win.openDevTools({ mode: 'detach' });
	/*
	 * The window frame blocks mouse events 4 pixels But only after hide()/ show()/ hide() is called!??!
	 * This is probably a bug?
	 */
	mini_win = win

	win.on('ready-to-show', () => {
		win.show();
		// To stop touch screens zooming like a browser
		win.webContents.setZoomFactor(1);
		win.webContents.setVisualZoomLevelLimits(1, 1);
	})

	{
		const win2 = new BrowserWindow({
			width: WINDOW_MIN_WIDTH,
			height: WINDOW_MIN_HEIGHT,
			minWidth: WINDOW_MIN_WIDTH,
			minHeight: WINDOW_MIN_HEIGHT,
			title: "Bob Rust",
			frame: false,
			transparent: true,
			maximizable: false,
			resizable: false,
			show: false,
			webPreferences: {
				backgroundThrottling: false,
				preload: path.join(__dirname, 'preload.js'),
				contextIsolation: true,
				enableRemoteModule: false,
				nodeIntegration: false,
				/* devTools: false, */
			}
		});

		// Was app/renderer/public/fullscreen_index.html
		const secondWindow = isDev ? "http://localhost:3000/" : url.format({
			pathname: path.join(__dirname, '/../../renderer/build/index.html'),
			protocol: 'file:',
			slashes: true
		});
		win2.loadURL(secondWindow);
		win2.setAlwaysOnTop(true, "screen-saver", 1);
		win2.openDevTools({ mode: 'detach' });
		maxi_win = win2;
	}

	// Disable reloading
	/*
	win.on('focus', (event) => {
		globalShortcut.register('CommandOrControl+R', () => {})
		globalShortcut.register('CommandOrControl+Shift+R', () => {})
		globalShortcut.register('F5', () => {})
	})

	win.on('blur', (event) => {
		globalShortcut.unregister('CommandOrControl+R')
		globalShortcut.unregister('CommandOrControl+Shift+R')
		globalShortcut.unregister('F5')
	})
	*/

	globalShortcut.register('F10', () => {
		mini_win.focus();
		maxi_win.focus();
	});

	setupWindowOpenHandler(win);
	setupWindowOpenHandler(maxi_win);
}

function setupWindowOpenHandler(win) {
	win.webContents.setWindowOpenHandler(({ url }) => {
		console.log("Test", url);
		if (url.startsWith('https://github.com/')) {
			shell.openExternal(url);
			return true;
		}
		return false
	})
	win.webContents.on('did-create-window', (childWindow) => {
		childWindow.webContents('will-navigate', (e) => {
			e.preventDefault()
		})
	})
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if(process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if(BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
})

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
})

ipcMain.handle('maximizeBrowserWindow', async (event) => {
	let size = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;
	mini_win.hide();
	maxi_win.setBounds(size, true);
	maxi_win.show();
	maxi_win.focusOnWebView();
})

ipcMain.handle('minimizeBrowserWindow', async (event) => {
	maxi_win.hide();
	mini_win.show();
	mini_win.focusOnWebView();

	// TODO: Reposition the mini window to the center of the screen.
})

ipcMain.handle('tryMoveWindowToCursorMonitor', async (event, enable) => {
	let bounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;
	let win_bounds = maxi_win.getBounds();

	if(win_bounds.x != bounds.x || win_bounds.y != bounds.y
	|| win_bounds.width != bounds.width || win_bounds.height != bounds.height) {
		maxi_win.setBounds(bounds, true)
	}
})

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
		})
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

let robot = require('robotjs');;

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
