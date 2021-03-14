const base = {
    appId: "com.bobrust.bobrustpainter",
    productName: "Bob Rust",
    remoteBuild: false,
    files: [
        "src/**/*",
        "renderer/*",
        "renderer/static/**/*"
    ],
    nsis: {
        publish: ["github"],
        include: "./scripts/installer.nsh",
        oneClick: false,
        perMachine: true,
        allowToChangeInstallationDirectory: true,
    },
}

module.exports = base;
