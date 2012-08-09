var path = require('path'),
    BASE_DIR = path.join(process.cwd(), '..', 'Ensighten', 'repos', 'interface_new'),
    directories = [
      // Base files
      '*.js',
      '*.json',
      '*.md',
      '.gitignore',
      '.nodemonignore',

      // 'apps': true,
      'controllers/**',
      'data/**',
      // 'exports': true,
      'pages/**',
      'models/**',
      'node_modules/ensApiClient/**',
      'public/css/**',
      'public/js/**',
      'routes/**',
      'scripts/**',
      'utils/**',
      'views/**'
    ];

module.exports = {
  'baseDir': BASE_DIR,
  'directories': directories,
  'editor': 'notepad++'
};