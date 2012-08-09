var path = require('path'),
    BASE_DIR = path.join(process.cwd(), '..', 'Ensighten', 'repos', 'interface_new'),
    directories = {
      // 'apps': true,
      'controllers': true,
      'data': true,
      'exports': true,
      'models': true,
      'node_modules': {
        'ensApiClient': true
      },
      'public': {
        'css': true,
        'js': true
      },
      'routes': true,
      'views': true
    };

module.exports = {
  'baseDir': BASE_DIR,
  'directories': directories,
  'editor': 'notepad++'
};