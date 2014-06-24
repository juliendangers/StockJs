var bcrypt = require('bcrypt');
/**
 *
 * @param salt : salt used for hashing
 * @param dbClient : database client
 */
 var UserMgmnt = function(salt, dbClient) {

	var salt = salt || '';

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

	/**
	 * Create a new user
	 * @param : email
	 * @param : password
	 * @return
	 */
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

	var generateSessionToken = function(email) {
		var time = new Date().getTime();
		return bcrypt.hash(email+time.toString() , salt, function(err, hash) {
			if(err) {
				// TODO : raise error
				return ;
			} else {
				return hash;
			}
		});
	};

	/**
	 * Authenticate the user
	 * @param : email
	 * @param : password
	 * @return : Object {authenticated -> Boolean, token -> String}
	 */
	var authenticate = function(email, password) {
		var user_id = dbClient.HGET("users",email);
		var ret = {};
		ret.authenticated = false;
		if(user_id) {
			if(hashPassword(password) === dbClient.hget("user:"+user_id,"password")) {
				// TODO : what do we do now ? set an auth token for the user, relative to the session, and send it to angular ?
				var auth = generateSessionToken(email);
				var old_auth_token = dbClient.HGET("user:"+user_id,"auth");
				dbClient.HSET("user:"+user_id.toString(), auth_token, auth, function(err, result) {
					if(result) {
						ret.authenticated = true;
						ret.token = auth;
						dbClient.HSET("auths",auth,user_id);
						dbClient.HDEL("auths",old_auth_token);
					}
				});
			}
		}
		return ret;
	};

	/**
	 * Check if the given email already exists
	 * @param : email
	 * @return : Boolean // TODO : check it
	 */
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