var request = require('request'),
	Hoek  = require('hoek'),
	_ = require('lodash');

//Declare internals
var internals = {};

exports = module.exports = internals.Connection = function Coherence (options) {

	Hoek.assert(this.constructor === internals.Connection, 'Coherence client must be created using new');
	Hoek.assert(options && options.host, 'Invalid host value');
	Hoek.assert(options && options.port, 'Invalid port value');
	Hoek.assert(options && options.context, 'Invalid Context');
	Hoek.assert(options && options.cache, 'Invalid Cache name');

	this.settings = _.clone(options, true);
	this.url = null;

};

function parseCacheResponse (res, body) {
	if(res.headers['content-type'] === 'application/json') {
		return JSON.parse(body);
	}
	if(res.headers['content-type'] === 'text/plain') {
		return body.toString();
	}
}

internals.Connection.prototype.start = function (callback) {

	//No initial connection required. 
	//TODO May be provide a way for Coherence REST to respond if a cache service is active
	this.isConnected = true;
	this.url = this.settings.host + ":" + this.settings.port + "/" + this.settings.context + "/" + this.settings.cache + "/";
	return callback();

};

internals.Connection.prototype.stop = function (callback) {

	//Nothing to stop
	if(this.url) {
		this.url = null;
		this.isConnected = false;
	}
};

internals.Connection.prototype.stop = function (callback) {

	return this.isConnected;

};

internals.Connection.prototype.get = function (key, callback) {

	if(!this.isConnected) {
		return callback(new Error('Coherence REST is not available'));
	} 

	var cacheUrl = this.url + "/" + key;

	request({
		method: 'GET',
		url: cacheUrl
	}, function (err, res, body){

		if(res.statusCode === 404) {
			return callback(null, null);
		}

		if(err) {
			return callback(err);
		}

		var cached = {

			item : parseCacheResponse(res, body),
			stored : "",
			ttl : ""

		};

		callback(null, cached);

	});

};

internals.Connection.prototype.set = function (key, value, ttl, callback) {

	if(!this.isConnected) {
		return callback(new Error('Coherence REST is not available'));
	} 


	var cacheUrl = this.url + "/" + key;

	request({
		method: 'PUT',
		url: cacheUrl,
		json: true,
		body: value
	}, function (err, res, body){

		if(res.statusCode === 404) {
			return callback(null, null);
		}

		if(err) {
			return callback(err);
		}

		var cached = {

			item : parseCacheResponse(res, body),
			stored : "",
			ttl : ""

		};

		callback(null, cached);

	});

};














