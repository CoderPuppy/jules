var t = require('./templating');

var compiled = t.compile('hello, <%= "world" %> <%? hello %> hello <%? end %>HI');

console.log('compiled:', compiled);
