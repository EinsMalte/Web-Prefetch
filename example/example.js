const wp = require('../index');
const path = require('path');

wp.setBasePath(path.dirname(__filename));
wp.registerAsBase('front/base.html');
wp.registerWebsite('front/index.html');
wp.build();
