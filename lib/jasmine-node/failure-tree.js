var FailureTree, _, coffeestack, path, sourceMaps;

path = require('path');

_ = require('underscore');

coffeestack = require('@lumine-code/coffeestack');

sourceMaps = {};

module.exports = FailureTree = (function() {
  class FailureTree {
    constructor() {
      this.suites = [];
    }

    isEmpty() {
      return this.suites.length === 0;
    }

    add(spec) {
      var base, base1, failure, failurePath, i, item, j, len, len1, name, name1, parent, parentSuite, ref, results;
      ref = spec.results().items_;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        if (!(item.passed_ === false)) {
          continue;
        }
        failurePath = [];
        parent = spec.suite;
        while (parent) {
          failurePath.unshift(parent);
          parent = parent.parentSuite;
        }
        parentSuite = this;
        for (j = 0, len1 = failurePath.length; j < len1; j++) {
          failure = failurePath[j];
          if ((base = parentSuite.suites)[name = failure.id] == null) {
            base[name] = {
              spec: failure,
              suites: [],
              specs: []
            };
          }
          parentSuite = parentSuite.suites[failure.id];
        }
        if ((base1 = parentSuite.specs)[name1 = spec.id] == null) {
          base1[name1] = {
            spec,
            failures: []
          };
        }
        parentSuite.specs[spec.id].failures.push(item);
        results.push(this.filterStackTrace(item));
      }
      return results;
    }

    filterJasmineLines(stackTraceLines) {
      var index, jasminePattern, results;
      jasminePattern = /^\s*at\s+.*\(?.*[\\\/]jasmine(-[^\\\/]*)?\.js:\d+:\d+\)?\s*$/;
      index = 0;
      results = [];
      while (index < stackTraceLines.length) {
        if (jasminePattern.test(stackTraceLines[index])) {
          results.push(stackTraceLines.splice(index, 1));
        } else {
          results.push(index++);
        }
      }
      return results;
    }

    filterTrailingTimersLine(stackTraceLines) {
      if (/^(\s*at .* )\(timers\.js:\d+:\d+\)/.test(_.last(stackTraceLines))) {
        return stackTraceLines.pop();
      }
    }

    filterSetupLines(stackTraceLines) {
      var index, removeLine, results;
      // Ignore all lines starting at the first call to Object.jasmine.executeSpecsInFolder()
      removeLine = false;
      index = 0;
      results = [];
      while (index < stackTraceLines.length) {
        removeLine || (removeLine = /^\s*at Object\.jasmine\.executeSpecsInFolder/.test(stackTraceLines[index]));
        if (removeLine) {
          results.push(stackTraceLines.splice(index, 1));
        } else {
          results.push(index++);
        }
      }
      return results;
    }

    filterFailureMessageLine(failure, stackTraceLines) {
      var errorLines, message, stackTraceErrorMessage;
      // Remove initial line(s) when they match the failure message
      errorLines = [];
      while (stackTraceLines.length > 0) {
        if (/^\s+at\s+.*\((.*):(\d+):(\d+)\)\s*$/.test(stackTraceLines[0])) {
          break;
        } else {
          errorLines.push(stackTraceLines.shift());
        }
      }
      stackTraceErrorMessage = errorLines.join('\n');
      ({message} = failure);
      if (stackTraceErrorMessage !== message && stackTraceErrorMessage !== `Error: ${message}`) {
        return stackTraceLines.splice(0, 0, ...errorLines);
      }
    }

    filterOriginLine(failure, stackTraceLines) {
      var column, filePath, line, match;
      if (stackTraceLines.length !== 1) {
        return stackTraceLines;
      }
      // Remove remaining line if it is from an anonymous function
      if (match = /^\s*at\s+((\[object Object\])|(null))\.<anonymous>\s+\((.*):(\d+):(\d+)\)\s*$/.exec(stackTraceLines[0])) {
        stackTraceLines.shift();
        filePath = path.relative(process.cwd(), match[4]);
        line = match[5];
        column = match[6];
        return failure.messageLine = `${filePath}:${line}:${column}`;
      }
    }

    filterStackTrace(failure) {
      var stackTrace, stackTraceLines;
      stackTrace = failure.trace.stack;
      if (!stackTrace) {
        return;
      }
      stackTraceLines = stackTrace.split('\n').filter(function(line) {
        return line;
      });
      this.filterJasmineLines(stackTraceLines);
      this.filterTrailingTimersLine(stackTraceLines);
      this.filterSetupLines(stackTraceLines);
      stackTrace = coffeestack.convertStackTrace(stackTraceLines.join('\n'), sourceMaps);
      if (!stackTrace) {
        return;
      }
      stackTraceLines = stackTrace.split('\n').filter(function(line) {
        return line;
      });
      this.filterFailureMessageLine(failure, stackTraceLines);
      this.filterOriginLine(failure, stackTraceLines);
      return failure.filteredStackTrace = stackTraceLines.join('\n');
    }

    forEachSpec({spec, suites, specs, failures} = {}, callback, depth = 0) {
      var child, failure, i, j, k, len, len1, len2, ref, ref1, results, results1;
      if (failures != null) {
        callback(spec, null, depth);
        results = [];
        for (i = 0, len = failures.length; i < len; i++) {
          failure = failures[i];
          results.push(callback(spec, failure, depth));
        }
        return results;
      } else {
        callback(spec, null, depth);
        depth++;
        ref = _.compact(suites);
        for (j = 0, len1 = ref.length; j < len1; j++) {
          child = ref[j];
          this.forEachSpec(child, callback, depth);
        }
        ref1 = _.compact(specs);
        results1 = [];
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          child = ref1[k];
          results1.push(this.forEachSpec(child, callback, depth));
        }
        return results1;
      }
    }

    forEach(callback) {
      var i, len, ref, results, suite;
      ref = _.compact(this.suites);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        suite = ref[i];
        results.push(this.forEachSpec(suite, callback));
      }
      return results;
    }

  };

  FailureTree.prototype.suites = null;

  return FailureTree;

}).call(this);
