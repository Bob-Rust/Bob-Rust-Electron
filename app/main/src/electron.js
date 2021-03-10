const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron')
const { dialog } = require('electron')
const { webContents } = require('electron')
const path = require('path')

const WINDOW_MIN_WIDTH = 652
const WINDOW_MIN_HEIGHT = 456

function createWindow() {
	const win = new BrowserWindow({
		width: WINDOW_MIN_WIDTH,
		height: WINDOW_MIN_HEIGHT,
		minWidth: WINDOW_MIN_WIDTH,
		minHeight: WINDOW_MIN_HEIGHT,
		frame: false,
		transparent: true,
		maximizable: false,
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			enableRemoteModule: false,
			nodeIntegration: false,
			/* devTools: false, */
		}
	})

	// win.setIgnoreMouseEvents(true)
	win.loadFile('app/renderer/public/index.html')
	win.setAlwaysOnTop(true, "screen-saver", 1)
	win.openDevTools({ mode: 'detach' })

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
	let win = BrowserWindow.fromId(event.sender.id)
	if(win) win.close()
})

ipcMain.handle('maximizeBrowserWindow', async (event) => {
	let win = BrowserWindow.fromId(event.sender.id)
	if(win) {
		let size = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds
		win.setBounds(size, true)
	}
})

ipcMain.handle('minimizeBrowserWindow', async (event) => {
	let win = BrowserWindow.fromId(event.sender.id)
	if(win) {
		let bounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds
		win.setBounds({
			x: (bounds.x + Math.trunc((bounds.width - WINDOW_MIN_WIDTH) / 2)),
			y: (bounds.y + Math.trunc((bounds.height - WINDOW_MIN_HEIGHT) / 2)),
			width: WINDOW_MIN_WIDTH,
			height: WINDOW_MIN_HEIGHT
		}, true)
	}
})

ipcMain.handle('setBrowserWindowResizable', async (event, enable) => {
	let win = BrowserWindow.fromId(event.sender.id)
	if(win) {
		win.setResizable(enable)
	}
})

ipcMain.handle('getWindowBounds', async (event) => {
	let win = BrowserWindow.fromId(event.sender.id)
	if(win) {
		return win.getBounds()
	}

	return { x: 0, y: 0, width: 0, height: 0 }
})

ipcMain.handle('tryMoveWindowToCursorMonitor', async (event, enable) => {
	let win = BrowserWindow.fromId(event.sender.id)
	if(win) {
		let bounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds
		let win_bounds = win.getBounds()

		if(win_bounds.x != bounds.x || win_bounds.y != bounds.y
		|| win_bounds.width != bounds.width || win_bounds.height != bounds.height) {
			win.setBounds(bounds, true)
		}
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