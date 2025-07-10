const http = require('http');
const https = require('https');
const querystring = require('querystring');

let search = require('./spotify_search.js');
let cacheCreator = require('./cache_creator.js');

const credentials = require('../auth/credentials.json');

const spotify_access_token_endpoint = 'https://accounts.spotify.com/api/token';

const authentication_req = function (response, user_input) {
  let body = '';
  const auth_sent_time = new Date();

  const post_data = querystring.stringify({
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    grant_type: 'client_credentials'
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': post_data.length
    }
  };

  const req = https.request(spotify_access_token_endpoint, options, function (authentication_res) {
    console.log("🔑 Requesting Spotify access token...");
    
    authentication_res.setEncoding('utf8');
    
    authentication_res.on('data', function (chunk) {
      body += chunk;
    });
    
    authentication_res.on('end', function () {
      try {
        let spotify_auth = JSON.parse(body);
        console.log("✅ Token received successfully");
        
        spotify_auth.expiration = auth_sent_time.getTime() + (spotify_auth.expires_in * 1000);
        
        // Cache the token
        cacheCreator.cache(spotify_auth);
        
        // Now search with the token
        search.search(spotify_auth.access_token, user_input, response);
        
      } catch (err) {
        console.error("❌ Error parsing authentication response:", err);
        response.writeHead(500, {'content-type': 'text/html'});
        response.end('<h1>Authentication Error</h1><p>Failed to get Spotify token</p><a href="/">Try again</a>');
      }
    });
    
    authentication_res.on('error', function (err) {
      console.error("❌ Authentication response error:", err);
      response.writeHead(500, {'content-type': 'text/html'});
      response.end('<h1>Authentication Error</h1><a href="/">Try again</a>');
    });
  });

  req.on('error', function (e) {
    console.error("❌ Authentication request error:", e);
    response.writeHead(500, {'content-type': 'text/html'});
    response.end('<h1>Network Error</h1><p>Could not connect to Spotify</p><a href="/">Try again</a>');
  });

  req.end(post_data);
};

module.exports.authReq = authentication_req;