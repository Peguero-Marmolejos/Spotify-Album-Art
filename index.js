const http = require('http');
const https = require('https');
const fs = require('fs');
const URL = require('url');

const port = 3000;

// Import your modules
let search = require('./js/spotify_search.js');
let authReq = require('./js/authRequest.js');
let authentication_cache = './auth/authentication-res.json';

// Global variable for user input
let user_input = '';

// Create server
const server = http.createServer(requestHandler);

function requestHandler(request, response) {
  console.log(`New request for ${request.url} from ${request.socket.remoteAddress}`);
  
  // Handle favicon requests
  if (request.url.startsWith('/favicon')) {
    response.writeHead(404);
    response.end();
    return;
  }
  
  // Serve album art images
  if (request.url.startsWith('/album-art/')) {
    try {
      const imagePath = '.' + request.url;
      if (fs.existsSync(imagePath)) {
        const image_stream = fs.createReadStream(imagePath);
        response.writeHead(200, {'content-type': 'image/jpeg'});
        image_stream.pipe(response);
        image_stream.on('error', function (err) {
          console.log('Image error:', err);
          response.writeHead(404);
          response.end();
        });
      } else {
        response.writeHead(404);
        response.end();
      }
    } catch (err) {
      console.log('Error serving image:', err);
      response.writeHead(404);
      response.end();
    }
    return;
  }
  
  // Handle search requests
  if (request.url.startsWith('/search')) {
    const q = URL.parse(request.url, true).query.q;
    console.log('Searching for:', q);
    
    if (!q || q.trim() === '') {
      response.writeHead(400, {'content-type': 'text/html'});
      response.end('<h1>Error: Please enter a search term</h1><a href="/">Go back</a>');
      return;
    }
    
    user_input = q.trim();
    check_for_cache(response);
    return;
  }
  
  // Serve the results page
  if (request.url === '/results' || request.url === '/album-request.html') {
    try {
      if (fs.existsSync('./album-request.html')) {
        const stream = fs.createReadStream('./album-request.html', 'utf-8');
        response.writeHead(200, { 'content-type': 'text/html' });
        stream.pipe(response);
      } else {
        response.writeHead(404, {'content-type': 'text/html'});
        response.end('<h1>No results yet. Please search first.</h1><a href="/">Go back</a>');
      }
    } catch (err) {
      console.log('Error serving results:', err);
      response.writeHead(500);
      response.end();
    }
    return;
  }
  
  // Serve the main search form (default route)
  if (request.url === '/' || request.url === '/index.html') {
    try {
      const searchFormPath = fs.existsSync('./html/search-form.html') ? './html/search-form.html' : './search-form.html';
      
      if (fs.existsSync(searchFormPath)) {
        const stream = fs.createReadStream(searchFormPath, 'utf-8');
        response.writeHead(200, { 'content-type': 'text/html' });
        stream.pipe(response);
      } else {
        // Fallback: serve basic search form
        response.writeHead(200, { 'content-type': 'text/html' });
        response.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Spotify Album Art Viewer</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              input[type="text"] { width: 300px; padding: 10px; font-size: 16px; }
              input[type="submit"] { padding: 10px 20px; font-size: 16px; background: #1db954; color: white; border: none; cursor: pointer; }
              input[type="submit"]:hover { background: #1aa34a; }
            </style>
          </head>
          <body>
            <h1>🎵 Spotify Album Art Viewer</h1>
            <p>Search for your favorite artists to see their album artwork!</p>
            <form action="/search" method="get">
              <input id="q" name="q" type="text" placeholder="Enter artist name (e.g., Pink Floyd)" required/>
              <input type="submit" value="Search Albums" />
            </form>
          </body>
          </html>
        `);
      }
    } catch (err) {
      console.log('Error serving search form:', err);
      response.writeHead(500);
      response.end();
    }
    return;
  }
  
  // 404 for everything else
  response.writeHead(404, {'content-type': 'text/html'});
  response.end('<h1>404 - Page Not Found</h1><a href="/">Go to search</a>');
}

const check_for_cache = function(response) {
  try {
    if (fs.existsSync(authentication_cache)) {
      // Clear require cache to get fresh data
      delete require.cache[require.resolve(authentication_cache)];
      let cached_auth = require(authentication_cache);
      
      if (new Date(cached_auth.expiration) > Date.now()) {
        console.log('Using cached token');
        search.search(cached_auth.access_token, user_input, response);
      } else {
        console.log('Token expired, getting new one');
        authReq.authReq(response, user_input);
      }
    } else {
      console.log('No cache found, requesting new token');
      authReq.authReq(response, user_input);
    }
  } catch (err) {
    console.log('Cache error:', err);
    console.log('Requesting new token');
    authReq.authReq(response, user_input);
  }
}

// Start server
server.listen(port, function() {
  console.log(`🚀 Spotify Album Art Viewer running on port ${port}`);
  console.log(`📱 Open http://localhost:${port} in your browser`);
  console.log(`🎵 Search for artists like: "Pink Floyd", "Taylor Swift", "The Beatles"`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Export for testing
module.exports = server;