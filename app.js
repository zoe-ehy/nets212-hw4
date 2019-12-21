/* Some initialization boilerplate. Also, we include the code from
   routes/routes.js, so we can have access to the routes. Note that
   we get back the object that is defined at the end of routes.js,
   and that we use the fields of that object (e.g., routes.get_main)
   to access the routes. */

var express = require('express');
var routes = require('./routes/routes.js');
var app = express();

app.use(express.bodyParser());
app.use(express.logger("default"));

//CREATE A SESSION OBJECT
app.use(express.cookieParser());
app.use(express.session({secret: 'thisIsMySecret'}));

//The line below tells Node to include a special header in the response that 
//tells the browser not to cache any files. That way, you do not need to 
//flush the browser's cache whenever you make changes.

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
app.use(function(req, res, next) {
 res.setHeader("Cache-Control", "no-cache must-revalidate");
	 return next();
	});
};

/* Below we install the routes. The first argument is the URL that we
   are routing, and the second argument is the handler function that
   should be invoked when someone opens that URL. Note the difference
   between app.get and app.post; normal web requests are GETs, but
   POST is often used when submitting web forms ('method="post"'). */

app.get('/', routes.redirect_restaurants, routes.get_login);
app.post('/checklogin', routes.redirect_restaurants, routes.check_login);

app.get('/signup', routes.redirect_restaurants, routes.get_signup);
app.post('/createaccount', routes.redirect_restaurants, routes.create_account);

app.get('/restaurants', routes.redirect_login, routes.display_restaurants);
app.get('/getRestaurants', routes.get_restaurants);

app.post('/addrestaurant', routes.redirect_login, routes.add_restaurant);
app.post('/deleterestaurant', routes.redirect_login, routes.delete_restaurant);

app.get('/logout', routes.redirect_login, routes.get_logout);



/* Run the server */

console.log('Author: Hooi Yee Er (zoeehy)');
app.listen(8080);
console.log('Server running on port 8080. Now open http://localhost:8080/ in your browser!');
