const base = {
    appId: "com.bobross.${name}",
    productName: "Bob Ross",
    remoteBuild: false,
    files: [
        "app/main/src/**/*",
        "app/renderer/build/**/*"
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
