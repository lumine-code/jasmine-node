var path = require('path');
var fs = require('fs');
var specs;

// Recursively collect absolute paths under `dir`, following directory symlinks
// (replaces walkdir.sync(dir, {follow_symlinks: true})). A visited set of real
// paths guards against symlink cycles.
var walkPaths = function(dir, visited) {
  visited = visited || new Set();
  var results = [];
  var real;
  try {
    real = fs.realpathSync(dir);
  } catch (e) {
    return results;
  }
  if (visited.has(real)) { return results; }
  visited.add(real);
  var entries;
  try {
    entries = fs.readdirSync(dir);
  } catch (e) {
    return results;
  }
  for (var i = 0; i < entries.length; i++) {
    var full = path.join(dir, entries[i]);
    results.push(full);
    var stat;
    try {
      stat = fs.statSync(full); // follows symlinks
    } catch (e) {
      continue;
    }
    if (stat.isDirectory()) {
      results = results.concat(walkPaths(full, visited));
    }
  }
  return results;
};

var createSpecObj = function(path, root) {
  return {
    path: function() { return path; },
    relativePath: function() { return path.replace(root, '').replace(/^[\/\\]/, '').replace(/\\/g, '/'); },
    directory: function() { return path.replace(/[\/\\][\s\w\.-]*$/, "").replace(/\\/g, '/'); },
    relativeDirectory: function() { return relativePath().replace(/[\/\\][\s\w\.-]*$/, "").replace(/\\/g, '/'); },
    filename: function() { return path.replace(/^.*[\\\/]/, ''); }
  };
};

exports.load = function(loadpaths, matcher) {
  var wannaBeSpecs = []
  specs = [];
  loadpaths.forEach(function(loadpath){
    wannaBeSpecs = walkPaths(loadpath);
    for (var i = 0; i < wannaBeSpecs.length; i++) {
      var file = wannaBeSpecs[i];
      try {
        if (fs.statSync(file).isFile()) {
          if (!/.*node_modules.*/.test(path.relative(loadpath, file)) &
              matcher.test(path.basename(file))) {
            specs.push(createSpecObj(file));
          }
        }
      } catch(e) {
        // nothing to do here
      }
    }
  });
};

exports.getSpecs = function() {
  // Sorts spec paths in ascending alphabetical order to be able to
  // run tests in a deterministic order.
  specs.sort(function(a, b) {
    return a.path().localeCompare(b.path());
  });
  return specs;
};
