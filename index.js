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
