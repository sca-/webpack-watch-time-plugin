# webpack-watch-time-plugin
Webpack plugin to display time when watcher rebuild happens

## Installation
`npm i -D 'webpack-watch-time-plugin'`

_In webpack.config.js_
```javascript
const WatchTimePlugin = require('webpack-watch-time-plugin');
let config = {
	// <...>

	plugins: [
		new WatchTimePlugin(),
	]
};

module.exports = config;
```

## Configuration
This plugin accepts an object with additional options:
- `noChanges`: `boolean` | `Object` — If provided, the plugin will detect if no changes in source files were made
- `logLevel`: `'error' | 'warn' | 'info'` — Log level for plugin output

Property | Type | Required | Default | Description
--- | --- | --- | --- | ---
noChanges.detect | boolean | No | false | Wherever to detect changes
noChanges.report | boolean | No | false | If detecting, wherever to report when no changes were made (if `false`, plugin will provide no output at all in these cases)
noChanges.includeNodeModules | boolean | No | false | Wherever to detect changes in `node_modules` folders either
logLevel | string | No | `'error'` | Log level for plugin output. For debugging issues use `logLevel: 'warn'`

### Example
```javascript
new WatchTimePlugin({
  noChanges: {
    detect: true,
    report: true
  },
  logLevel: 'warn'
})
```

## Usage
`webpack -w`

![webpack -w output](./screenshot.png)
