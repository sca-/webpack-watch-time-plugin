// cli output colors
const RED = '\033[0;31m'
const GREEN ='\033[0;32m'
const NC ='\033[0m'

module.exports = function() {
	this.plugin('watch-run', function(watching, callback) {
		const time = new Date();
		console.log(
			`_____________\n`,
			`${GREEN}${time.getHours()}:${RED}${("0" + time.getMinutes()).slice(-2)}:${("0" + time.getSeconds()).slice(-2)} ${GREEN}⇩${NC}`
		);
		callback();
	})
}
