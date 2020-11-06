module.exports = function (api) {
    api.cache(true);
    const presets = [
        ["@babel/preset-env", {
            // "debug": true,
            useBuiltIns: "usage",
            corejs: 3, // or 2,
            "targets": "last 3 versions"
        }]
    ];
    return {
        presets
    }
}