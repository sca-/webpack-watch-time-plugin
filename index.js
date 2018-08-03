// cli output colors
const RED = '\033[0;31m'
const GREEN ='\033[0;32m'
const YELLOW ='\033[0;33m'
const CYAN ='\033[0;36m'
const NC ='\033[0m'

const LOG_LEVELS = {
  error: {
    value: 1,
    color: RED
  },
  warn: {
    value: 2,
    color: YELLOW
  },
  info: {
    value: 3,
    color: CYAN
  }
};

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
  const self = this;
  self.noChanges = { detect: false, report: false, includeNodeModules: false };
  self.logLevel = 'error';
  if (options) {
    if (options.noChanges) {
      if (typeof options.noChanges === 'object') {
        Object.assign(self.noChanges, options.noChanges);
      } else {
        self.noChanges.detect = true;
      }
    }
    if (options.logLevel && Object.keys(LOG_LEVELS).indexOf(options.logLevel) >= 0) {
      self.logLevel = options.logLevel;
    }
  }
  self.log('info')('WatchTimePlugin started with options ' + JSON.stringify({ noChanges: self.noChanges, logLevel: self.logLevel }));
}

WatchTimePlugin.prototype.log = function log(level) {
  const self = this;
  const noop = function() {};
  if (Object.keys(LOG_LEVELS).indexOf(level) < 0) {
    return noop;
  }
  if (LOG_LEVELS[self.logLevel]['value'] < LOG_LEVELS[level]['value']) {
    return noop;
  }
  return function(message) {
    console.log(`${LOG_LEVELS[level]['color']}[WatchTimePlugin]: ${message}${NC}`);
  }
}

WatchTimePlugin.prototype.onWatchRun = function onWatchRun(watching, callback) {
  const self = this;
  self.changesWereMade = false;
  const changes = Object.keys(watching.watchFileSystem.watcher.mtimes);
  let realChanges, fakeChanges;

  // If should report on no changes -> roll through source files and detect inner changes
  if (self.noChanges.detect) {
    realChanges = [];
    fakeChanges = [];
    changes.forEach(function(file) {
      let hash;
      try {
        hash = getFileHash(file);
      } catch (e) {
        self.log('warn')(`Cannot get source of "${file}"`);
      }
      if (!self.sourceFiles) {
        self.changesWereMade = true;
      } else if (hash && hash !== self.sourceFiles[file]) {
        realChanges.push(file);
        self.sourceFiles[file] = hash;
        self.changesWereMade = true;
      } else {
        fakeChanges.push(file);
      }
    });
  }

  let message = 'Rebuild was triggered';
  if (realChanges && (realChanges.length + fakeChanges.length > 0)) {
    message += ` by files: \n\t `;
    if (realChanges.length > 0) {
      message += `-${realChanges.join('\n\t -')}\n\t `;
    }
    if (fakeChanges.length > 0) {
      message += `${RED}-${fakeChanges.join('\n\t -')}${NC}`;
    }
  } else if (changes && changes.length > 0) {
    message += `by files: \n\t -${changes.join('\n\t -')}`;
  }
  self.log('info')(message);

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
  if (!self.sourceFiles && watching.fileDependencies) {
    self.sourceFiles = {};
    let sourceFiles = Array.from(watching.fileDependencies);
    if (!self.noChanges.includeNodeModules) {
      sourceFiles = sourceFiles.filter(function(file) {
        return file.indexOf('node_modules') < 0;
      });
    }
    sourceFiles.forEach(function(file) {
      try {
        self.sourceFiles[file] = getFileHash(file);
      } catch (e) {
        self.log('warn')(`Cannot get source of "${file}"`);
      }
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
