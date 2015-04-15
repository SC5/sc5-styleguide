
function removeIgnoredBlocks(string) {
  var lines = string.split('\n'),
    results = [],
    ignoreEnabled = false;
  lines.forEach(function(line) {
    if (line.indexOf('styleguide:ignore:start') !== -1) {
      ignoreEnabled = true;
    } else if (line.indexOf('styleguide:ignore:end') !== -1) {
      ignoreEnabled = false;
    } else if (!ignoreEnabled) {
      results.push(line);
    }
  });
  return results.join('\n');
}

module.exports = {
  removeIgnoredBlocks: removeIgnoredBlocks
};
