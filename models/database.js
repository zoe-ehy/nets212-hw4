var keyvaluestore = require('../models/keyvaluestore.js');

//Sets up USERS table
var userKVS = new keyvaluestore('users');
userKVS.init(function(err, data){});

//Sets up RESTAURANTS table
var resKVS = new keyvaluestore('restaurants');
resKVS.init(function(err, data){});

/* The function below is an example of a database method. Whenever you need to
   access your database, you should define a function (myDB_addUser, myDB_getPassword, ...)
   and call that function from your routes - don't just call DynamoDB directly!
   This makes it much easier to make changes to your database schema. */

//Look ups the password for a given username in the USER table
var users_lookup = function(username, route_callbck){
  console.log('Looking up user: ' + username);
  userKVS.get(username, function (err, data) {
    if (err) {
      route_callbck(null, "Lookup user error: "+err);
    } else if (data == null) {
      console.log('NO USER FOUND');
      route_callbck(null, null);
    } else {
    	console.log('FOUND USER: ' + username);
      route_callbck({ passwordAndFullName : data[0].value }, null);
    }
  });
};

//Look ups the inx value for a given restaurant in the RESTAURANT table
var restaurants_lookup = function(name, route_callbck){
  console.log('Looking up restaurant: ' + name);
  resKVS.get(name, function (err, data) {
    if (err) {
      route_callbck(null, "Lookup restaurant error: "+err);
    } else if (data == null) {
      console.log('NO RESTAURANT FOUND');
      route_callbck(null, null);
    } else {
    	console.log('FOUND RESTAURANT: ' + name);
      route_callbck({ inxValue : data[0].inx }, null);
    }
  });
};

//Checks if a given username exists in the USER table
var users_checkExist = function(username, route_callbck){
	  console.log('Checking if username exists: ' + username);
	  userKVS.exists(username, function (err, data) {
	    if (err) {
	      route_callbck(null, "userCheckExist error: "+err);
	    } else if (data == null) {
	      console.log('No existing user, create new account');
	      route_callbck(null, null);
	    } else {
	    	console.log('FOUND: ' + username + 'Cannot create new account');
	    	route_callbck(data, null);
	    }
	  });
	};

//Adds a new user to the USER table
var users_add = function(username, passwordAndFullName, route_callbck){
	  console.log('Adding key: ' + username);
	  console.log('Adding value: ' + passwordAndFullName);
	  
	  userKVS.put(username, passwordAndFullName, function (err, inx) {
	    if (err) {
	      route_callbck(null, "addUser error: "+ err);
	    } else if (inx == null) {
	      console.log('Unable to create new user');
	      route_callbck(null, null);
	    } else {
	    	console.log('Added: ' + username + ' ' + inx);
	    	route_callbck(inx, null);
	    }
	  });
	};

//Gets all entries in the RESTAURANT table
var restaurants_retrieve = function(route_callbck){
	  console.log('Scanning RESTAURANTS table... ' );
	  resKVS.scanKeys( function (err, values) {
	    if (err) {
	      route_callbck(null, "Scanning error: "+ err);
	    } else if (values == null) {
	      route_callbck(null, null);
	    } else {
	    	console.log('Scan success');
	      route_callbck({ retrievedKeys : values }, null);
	    }
	  });
	};

//Checks if a given restaurant exists in the RESTAURANT table
var restaurants_checkExist = function(resName, route_callbck){
	  console.log('Checking if restaurant exists: ' + resName);
	  userKVS.exists(resName, function (err, data) {
	    if (err) {
	      route_callbck(null, "restaurantCheckExist error: "+ err);
	    } else if (data == null) {
	      console.log('No existing restaurant, add new restaurant');
	      route_callbck(null, null);
	    } else {
	    	console.log('FOUND: ' + resName + 'Cannot create new duplicate restaurant');
	    	route_callbck(data, null);
	    }
	  });
	};

//Adds a new restaurant to the RESTAURANT table
var restaurants_add = function(name, restaurantInfo, route_callbck){
	  console.log('Adding key: ' + name);
	  console.log('Adding value: ' + restaurantInfo);
	  
	  resKVS.put(name, restaurantInfo, function (err, inx) {
	    if (err) {
	      route_callbck(null, "addRestaurant error: "+ err);
	    } else if (inx == null) {
	      console.log('Unable to add new restaurant');
	      route_callbck(null, null);
	    } else {
	    	console.log('Added: ' + name + ' ' + inx);
	    	route_callbck(inx, null);
	    }
	  });
	};
	
//Deletes an existing restaurant from the RESTAURANT table
var restaurants_delete = function(name, inx, route_callbck){
	  console.log('Deleting restaurant: ' + name);
	  
	  resKVS.remove(name, inx, function (err, data) {
	    if (err) {
	      route_callbck(null, "deleteRestaurant error: " + err);
	    } else if (data == null) {
	      console.log('Unable to delete ' + name);
	      route_callbck(null, null);
	    //successful deletion
	    } else {
	    	console.log('Deleted: ' + name + " " + data);
	    	route_callbck(data, null);
	    }
	  });
	};

/* We define an object with one field for each method. For instance, below we have
   a 'lookup' field, which is set to the myDB_lookup function. In routes.js, we can
   then invoke db.lookup(...), and that call will be routed to myDB_lookup(...). */

var database = {
  userLookup: users_lookup,
  userCheckExist: users_checkExist,
  addUser: users_add,
  resLookup: restaurants_lookup,
  retrieveRestaurants: restaurants_retrieve, 
  resCheckExist: restaurants_checkExist,
  addRestaurant: restaurants_add,
  deleteRestaurant: restaurants_delete
};

module.exports = database;
