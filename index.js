// cli output colors
const RED = '\033[0;31m'
const GREEN ='\033[0;32m'
const NC ='\033[0m'

const fs = require('fs');
const crypto = require('crypto');

function getFileHash(file) {
  const data = fs.readFileSync(file, 'utf8');
  return crypto.createHash('md5').update(data).digest("hex");
}

/**
 *
 * @param {*} options - object with plugin parameters:
 *  noChanges: Object {
 *    detect: boolean,
 *    report: boolean,
 *    includeNodeModules: boolean
 *  } -   when set, plugin will report (report: true) or skip output at all (report: false)
 *        if rebuild was triggered with no changes in source files.
 */
function WatchTimePlugin(options) {
  this.noChanges = { detect: false, report: false, includeNodeModules: false };
  if (options && options.noChanges) {
    if (typeof options.noChanges === 'object') {
      Object.assign(this.noChanges, options.noChanges);
    } else {
      this.noChanges.detect = true;
    }
  }
}

WatchTimePlugin.prototype.onWatchRun = function onWatchRun(watching, callback) {
  const self = this;
  self.changesWereMade = false;

  // If should report on no changes -> roll through source files and detect inner changes
  if (self.noChanges.detect) {
    Object.keys(watching.watchFileSystem.watcher.mtimes).forEach(function(file) {
      const hash = getFileHash(file);
      if (hash !== self.sourceFiles[file]) {
        self.sourceFiles[file] = hash;
        self.changesWereMade = true;
      }
    });
  }

  const time = new Date();
  let messageParts = [
    `_____________`,
    `${GREEN}${time.getHours()}:${RED}${("0" + time.getMinutes()).slice(-2)}:${("0" + time.getSeconds()).slice(-2)} ${NC}⬇️`
  ];


  if (self.noChanges.detect && !self.changesWereMade && self.sourceFiles) {
    if (self.noChanges.report) {
      messageParts.push(`${RED}NO CHANGES WERE MADE${NC}`);
    } else {
      messageParts = [];
    }
  }

  if (messageParts.length > 0) {
    console.log(messageParts.join('\n'));
  }
	callback();
}

WatchTimePlugin.prototype.onEmit = function onEmit(watching, callback) {
  const self = this;

  if (!self.noChanges.detect) {
    return callback();
  }

  // First build fills up source filenames array and theis initial content hashes
  // (excluding node_modules files for productivity)
  self.sourceFiles = self.sourceFiles || {};
  if (!self.changesWereMade && watching.fileDependencies) {
    let sourceFiles = Array.from(watching.fileDependencies);
    if (!self.noChanges.includeNodeModules) {
      sourceFiles = sourceFiles.filter(function(file) {
        return file.indexOf('node_modules') < 0;
      });
    }
    sourceFiles.forEach(function(file) {
      self.sourceFiles[file] = getFileHash(file);
    });
  }
  callback();
}

WatchTimePlugin.prototype.apply = function(compiler) {
  const self = this;
  if (compiler.hooks) {
		compiler.hooks.watchRun.tapAsync('watch-time', self.onWatchRun.bind(self));
		compiler.hooks.emit.tapAsync('watch-changes', self.onEmit.bind(self));
	} else {
		compiler.plugin('watch-run', self.onWatchRun);
	}
}

module.exports = WatchTimePlugin;
