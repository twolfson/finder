var path = require('path'),
    BASE_DIR = path.join(__dirname + '/../dir/I/want/to/search'),
    directories = [
      '*.js',
      '*.json',
      '*.md',
      '.gitignore',
      '.nodemonignore',
      'any.minimatch.pattern/**/*.js'
    ];

module.exports = {
  'baseDir': BASE_DIR,
  'directories': directories,
  'editor': 'notepad++'
};