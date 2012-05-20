var t = require('./templating');

var parsed = t.parse('hello, <%= "world" %> <%? $.hello %> hello <%? end %>HI<%= helper(function(arg1, arg2) { %> hello <% }); %>');

console.log('parsed:', parsed);

var compiled = t.compile(parsed);

console.log('compiled:', compiled);
