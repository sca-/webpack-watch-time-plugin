// cli output colors
const GREEN ='\033[0;32m'
const NC ='\033[0m'

function onWatchRun(watching, callback) {
	const time = new Date();
	console.log(
		`_____________\n`,
		`${GREEN}${time.getHours()}:${("0" + time.getMinutes()).slice(-2)}:${("0" + time.getSeconds()).slice(-2)} ⇩${NC}`
	);
	callback();
}

module.exports = function() {
	if (this.compiler.hooks) {
		this.compiler.hooks.watchRun.tap('watch-time', onWatchRun);
	} else {
		this.compiler.plugin('watch-run', onWatchRun);
	}
}
