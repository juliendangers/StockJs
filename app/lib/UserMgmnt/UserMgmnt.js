var bcrypt = require('bcrypt');
/**
 *
 * @param salt : salt used for hashing
 * @param dbClient : database client
 */
var UserMgmnt = function(salt, dbClient) {
	
	var salt = salt || "";

	var hashPassword= function(password) {
    return bcrypt.hash(password, salt, function(err, hash) {
      if(err) {
      	// TODO : handle error
      	return ;
      } else {
      	return hash;
      }
    });
	};
	
	var create = function(email, password) {
		var hp = hashPassword(password);
		dbClient.INCR("next_user_id", function (err, user_id) {
			if(err) {
				// TODO : handle error
			} else {
	      dbClient.HMSET("user:"+user_id.toString(), {
	      	email:email,
	      	password:hp
	      }, function(err, result){
	      	if(err) {
						// TODO : handle error
	      	} else {
	      		dbClient.HSET("users", email, user_id, function(err, status) {
	      			// TODO : check everything went on smoothly
	      			if(err) {
	      				// FAIL
	      			}
	      		});
	      	}
	      });
	    }	
    });
	};
	
	var authenticate = function(email, password) {
		var user_id = dbClient.HGET("users",email);
		if(user_id) {
			if(hashPassword(password) === dbClient.hget("user:"+user_id,"password")) {
				// TODO : what do we do now ? set an auth token for the user, relative to the session, and send it to angular ?
			} else {
				// wrong password
			}
		} else {
			// wrong email
		}
	};

	var userExists = function(email) {
		// TODO : test what HGET return on non existing value
		return dbClient.HGET("users",email) > 0;
	}

	return {
		create: create,
		authenticate: authenticate,
		userExists:userExists
	}
}
module.exports = UserMgmnt;