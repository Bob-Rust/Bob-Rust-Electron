# Bob Rust Electron
We still need to fully automate this with https://github.com/sekwah41/primitive however this is the starts of a new painting application for rust which paints pictures relatively fast.

The results will get faster and higher quality re-creations as we fine-tune the code though obviously there is a limit :P

## Building
To build this you will need to install electron 12.0.0 and install robotjs and rebuild it for the current version of electron.

```
npm install electron@12.0.0
npm install robotjs
npm rebuild --runtime=electron --target=12.0.0 --disturl=https://atom.io/download/atom-shell --abi=83
```

## In game
![In game](.github/assets/screenshots/ingame.jpg)