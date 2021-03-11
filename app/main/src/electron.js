const { app, BrowserWindow, globalShortcut, ipcMain, screen, dialog, shell } = require('electron')
const path = require('path')

// TODO: Create a shadow around the minified window to make it easer to spot.
const WINDOW_MIN_WIDTH = 240; //652
const WINDOW_MIN_HEIGHT = 480; // 456

let mini_win = null
let maxi_win = null

function createWindow() {
	const win = new BrowserWindow({
		width: WINDOW_MIN_WIDTH,
		height: WINDOW_MIN_HEIGHT,
		minWidth: WINDOW_MIN_WIDTH,
		minHeight: WINDOW_MIN_HEIGHT,
		frame: false,
		transparent: false,
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
	})
	
	win.loadFile('app/renderer/public/index.html')
	win.setAlwaysOnTop(true, "screen-saver", 1)
	win.openDevTools({ mode: 'detach' })
	/*
	 * The window frame blocks mouse events 4 pixels But only after hide()/ show()/ hide() is called!??!
	 * This is probably a bug?
	 */
	mini_win = win

	win.on('ready-to-show', () => {
		win.show()
	})

	{
		const win2 = new BrowserWindow({
			width: WINDOW_MIN_WIDTH,
			height: WINDOW_MIN_HEIGHT,
			minWidth: WINDOW_MIN_WIDTH,
			minHeight: WINDOW_MIN_HEIGHT,
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
		})
		
		win2.loadFile('app/renderer/public/fullscreen_index.html')
		win2.setAlwaysOnTop(true, "screen-saver", 1)
		win2.openDevTools({ mode: 'detach' })
		maxi_win = win2
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
		mini_win.focus()
		maxi_win.focus()
	})
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if(process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if(BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

// icpMessages
ipcMain.handle('closeBrowserWindow', async (event) => {
	try {
		mini_win.close()
	} catch(e) {
		console.warn(e)
	}

	try {
		maxi_win.close()
	} catch(e) {
		console.warn(e)
	}
})

ipcMain.handle('maximizeBrowserWindow', async (event) => {
	let size = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds
	mini_win.hide()
	maxi_win.setBounds(size, true)
	maxi_win.show()
	maxi_win.focusOnWebView()
})

ipcMain.handle('minimizeBrowserWindow', async (event) => {
	maxi_win.hide()
	mini_win.show()
	mini_win.focusOnWebView()

	// TODO: Reposition the mini window to the center of the screen.
})

ipcMain.handle('tryMoveWindowToCursorMonitor', async (event, enable) => {
	let bounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds
	let win_bounds = maxi_win.getBounds()

	if(win_bounds.x != bounds.x || win_bounds.y != bounds.y
	|| win_bounds.width != bounds.width || win_bounds.height != bounds.height) {
		maxi_win.setBounds(bounds, true)
	}
})

ipcMain.handle('openTextureDialog', async (event, enable) => {
	let win = BrowserWindow.fromId(event.sender.id)
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
})

ipcMain.handle('setIgnoreMouseEvents', async (event, enable) => {
	let win = BrowserWindow.fromId(event.sender.id)
	if(win) {
		win.setIgnoreMouseEvents(enable)
	}
})

ipcMain.handle('openBrowserLink', async (event, href) => {
	shell.openExternal(href)
})

// =======================

let robot = require('robotjs');

ipcMain.handle('robot_mouseClick', async (event) => {
	robot.mouseClick()
})

ipcMain.handle('robot_mouseMove', async (event, x, y) => {
	robot.moveMouse(x, y)
})

ipcMain.handle('robot_mouseDelay', async (event, delay) => {
	robot.setMouseDelay(delay)
})

ipcMain.handle('robot_checkMouse', async (event, x, y) => {
	let pos = robot.getMousePos()
	return pos.x == Math.trunc(x) && pos.y == Math.trunc(y)
})

ipcMain.handle('robot_screenshot', async (event, x, y, width, height) => {
	let result = robot.screen.capture(x, y, width, height)

	return {
		width: result.width,
		height: result.height,
		bytePerPixel: result.bytesPerPixel,
		image: result.image,
	};
})