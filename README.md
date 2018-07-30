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

Property | Type | Required | Description
--- | --- | --- | --- 
noChanges.detect | boolean | No | Wherever to detect changes
noChanges.report | boolean | No | If detecting, wherever to report when no changes were made (if `false`, plugin will provide no output at all in these cases)
noChanges.includeNodeModules | boolean | No | Wherever to detect changes in `node_modules` folders either

### Example
```javascript
new WatchTimePlugin({
  noChanges: {
    detect: true,
    report: true
  }
})
```

## Usage
`webpack -w`

![webpack -w output](./screenshot.png)
