var db = require('../models/database.js');

var getLogin = function(req, res) {
  res.render('login.ejs', {message: null});
};

var checkLogin = function(req, res) {
	var inputUsername = req.body.username;
	var inputPassword = req.body.password;
	
	//displays an error message if user only provides whitespace in any of the fields (blank)
	if (inputUsername == "" || inputPassword == "") {
		res.render('signup.ejs', {message: "Please only provide non-blank entries."});
	}

	db.userLookup(inputUsername, function(data, err) {
		//error while looking up database
	    if (err) {
	        res.render('login.ejs', {message: err});
	    //successful lookup, username found
	      } else if (data) {
	    	  
	    	  var str = data.passwordAndFullName;
	    	  var formatStr = str.replace(/["{}]+/g, '');	//removes quotation marks and curly braces
	    	  var passAndName = formatStr.split(",");
	    	  var password = passAndName[0].split(":")[1];
	    	  var fullname = passAndName[1].split(":")[1];
	    	  
	    	  //correct password
	    	  if (inputPassword == password) {
	    		  req.session.username = inputUsername;
	    		  req.session.loggedInError = null;
	    		  res.redirect('/restaurants');
	    	  }
	    	  //incorrect password
	    	  else {
	    		  res.render('login.ejs', {message: "Invalid credentials"});
	    	  }

	      //username not found
	      } else {
	    	  res.render('login.ejs', {message: "Invalid credentials"});
	      }
	    });

}

var getSignUp = function(req, res) {
	  res.render('signup.ejs', {message: null});
	};
	
var createAccount = function(req, res) {
	var inputUsername = req.body.username.trim();
	var inputPassword = req.body.password.trim();
	var inputFullName = req.body.fullname.trim();
	
	//displays an error message if user only provides whitespace in any of the fields (blank)
	if (inputUsername == "" || inputPassword == "" || inputFullName == "" ) {
		res.render('signup.ejs', {message: "Please only provide non-blank entries."});
	}
	
	var passAndName = '{"password":"' + inputPassword + '","fullName":"' + inputFullName + '"}';
	
	db.userCheckExist(inputUsername, function(data, err) {
		//error checking if entry exists in database
	    if (err) {
	        res.render('signup.ejs', {message: err});
	    //username exists, cannot create account
	      } else if (data) {
	    	res.render('signup.ejs', {message: "User already exists. Please choose another username or proceed to the Login page to log in."});
	    	 
	      //username not found, CREATE NEW ACCOUNT IN DATABASE
	      } else {
	    	  
	    	  db.addUser(inputUsername, passAndName,function(inx, err) {
	    		  	//error adding new user to database
	    		    if (err) {
	    		        res.render('signup.ejs', {message: err});
	    		    //username exists, cannot create account
	    		      } else if (inx == null) {
	    		    	res.render('signup.ejs', {message: inx});
	    		      } else {
	    		    	  //automatically logs in: create new session object
	    		    	  req.session.username = inputUsername;
	    		    	  req.session.loggedInError = null;
	    		    	  res.redirect('/restaurants');

	    		      }
	    	  });
	      }
	    });
	
}

var displayRestaurants = function(req,res) {
	res.render('restaurants.ejs', {message: null});
}

//used to retrieve all restaurant data to display in a table
var getRestaurantsMS1 = function(req, res) {
	  
	  db.retrieveRestaurants(function(data, err) {
		  	//error retrieving data from database
		    if (err) {
		    	res.render('restaurants.ejs', {message: 'Error retreiving data from database'});
		    //username exists, cannot create account
		      } else if (data== null) {
		    	res.render('restaurants.ejs', {message: 'No existing restaurants.'});
		      } else {
		    	  //array of JSON objects where key = restaurantName and value = restaurantInfo (lat, long, description, creator)
		    	  var restaurants = data.retrievedKeys;
		    	  if (req.session.loggedInError) {
		    		  var errorMessage = req.session.loggedInError;
		    		  res.render('restaurants.ejs', {message: errorMessage, resDataList: restaurants});
		    	  } else {
		    		  res.render('restaurants.ejs', {message: null, resDataList: restaurants});
		    	  }
		    	  
		      }
	  });
	};
	
//used to add retrieve all restaurant data to populate map with markers
var getRestaurants = function(req, res) {
	  
	  db.retrieveRestaurants(function(data, err) {
		  	//error retrieving data from database
		    if (err) {
		    	res.render('restaurants.ejs', {message: 'Error retreiving data from database'});
		    //username exists, cannot create account
		      } else if (data == null) {
		    	res.render('restaurants.ejs', {message: 'No existing restaurants.'});
		      } else {
		    	  //if user has not logged in but tried to access /restaurants
		    	  if (req.session.loggedInError) {
		    		  var errorMessage = req.session.loggedInError;
		    		  res.render('restaurants.ejs', {message: errorMessage});
		    	  } else {
		    		//array of JSON objects where key = restaurantName and value = restaurantInfo (lat, long, description, creator)
		    		  var restaurants = data.retrievedKeys;
		    		  var currentUser = {username : req.session.username}
		    		  //adds the current user to the start of the restaurant data list to be sent over to the client-side
		    		  restaurants.unshift(currentUser);
		    		  res.json(restaurants);
		    	  }
		    	  
		      }
	  });
	};

var addRestaurant = function(req, res) {
	var inputName = req.body.name;
	var inputLat = req.body.latitude;
	var inputLong = req.body.longitude;
	var inputDescription = req.body.description;
	var creator = req.session.username;
	
	var resInfo = '{"latitude":"' + inputLat + '","longitude":"' + inputLong + '","description":"' + inputDescription + '","creator":"' + creator + '"}';
	
	console.log("INPUT NAME");
	if (inputName=="" || inputLat=="" || inputLong=="" || inputDescription==""){
		res.send("Empty field error");
	};
	
	db.resCheckExist(inputName, function(data, err) {
		//error when checking if entry exists in restaurant database
	    if (err) {
	        res.render('restaurants.ejs', {message: err});
	    //restaurant already exists, cannot add restaurant
	      } else if (data) {
	    	res.render('restaurants.ejs', {message: "Restaurant already exists in database."});
	    	 
	      //restaurant not found, ADD NEW RESTAURANT TO DATABASE
	      } else {
	    	  
	    	  db.addRestaurant(inputName, resInfo, function(inx, err) {
	    		  	//error adding new restaurant to database
	    		    if (err) {
	    		        res.render('restaurants.ejs', {message: err});
	    		    //username exists, cannot create account
	    		      } else if (inx == null) {
	    		    	res.render('restaurants.ejs', {message: inx});
	    		      } else {
	    		    	  //successfully adds to database
	    		    	  //sends string containing new restaurant data back to the client to be used to create a new marker
	    		    	  res.send(inputName + " " + inputLat + " " + inputLong + " " + inputDescription + " " + creator);
	    		      }
	    	  });
	      }
	    });
	};

var deleteRestaurant = function(req, res) {
	
		var name = req.body.name;
	  
		//looks up inx value by given restaurant name to be used in delete function
		db.resLookup(name, function(data, err) {
			
			//error while looking up database
		    if (err) {
		        res.send(err);
		    //successful lookup, restaurant found
		      } else if (data) {
		    	  
		    	  //retrieves inxValue
		    	  var inx = data.inxValue;
		    	  
		    	  db.deleteRestaurant(name, inx, function(data, err) {
		    		  	//error deleting restaurant from database
		    		    if (err) {
		    		    	res.send(err);
		    		      } else if (data == null) {
		    		    	  res.send('error');
		    		      } else {
		    		    	  //successful deletion from database
		    		    	  //sends string containing deleted restaurant data back to the client
		    		    	  res.send(data);
		    		      }
		    	  });
		    	  

		      //restaurant not found
		      } else {
		    	  res.send(name + ' does not exist.');
		      }
		});
	};
	
var getLogout = function(req, res) {
	  req.session.username = null;
	  res.redirect('/');
	};

//function redirects a non-logged-in user back to the Login page if they try to access a page that requires log-in
//used when accessing "/restaurants" and "/logout" when user is not logged in
var redirectLogin = function(req, res, next) {
	  if (!req.session.username) {
		  res.redirect('/');
	  }
	  else  {
		  next();
	  }
	};

//function redirects an already logged-in user back to the Restaurants page if they try to revert back to the login or signup page
//used when accessing "/" and "/signup" when user is already logged in 
var redirectRestaurants = function(req, res, next) {
	  if (req.session.username) {
		  console.log("Redirected to Restaurants because already logged in");
		  req.session.loggedInError = "Already logged in. Please log out to revisit the Login or Signup page.";
		  res.redirect('/restaurants');
	  }
	  else  {
		  next();
	  }
	};


var routes = {
  get_login: getLogin,
  check_login: checkLogin,
  get_signup: getSignUp,
  create_account: createAccount,
  display_restaurants: displayRestaurants,
  get_restaurants: getRestaurants,
  add_restaurant: addRestaurant,
  delete_restaurant: deleteRestaurant,
  get_logout: getLogout,
  redirect_login: redirectLogin,
  redirect_restaurants: redirectRestaurants
};

module.exports = routes;
