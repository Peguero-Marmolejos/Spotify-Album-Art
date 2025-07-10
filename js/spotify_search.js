const querystring = require('querystring'); 
const https = require('https');
const http = require('http');
const fs = require("fs");
const path = require('path');

let image_data = [];
let image_counter = 0;
let max_length = 0;
let current_user_input = '';

const search = function(spotify_auth, user_input, response) {
  console.log(`🔍 Searching for: ${user_input}`);
  
  // Reset counters for new search
  image_data = [];
  image_counter = 0;
  max_length = 0;
  current_user_input = user_input;

  const uri = querystring.stringify({
    q: user_input,
    type: 'album',
    limit: 20
  });

  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${spotify_auth}`,
      'Content-Type': 'application/json'
    }
  };

  const search_endpoint = `https://api.spotify.com/v1/search?${uri}`;
  
  const req = https.request(search_endpoint, options, function (api_response) {
    console.log("📡 Getting search results from Spotify API...");
    
    let body = "";
    
    api_response.on('data', function (chunk) {
      body += chunk;
    });
    
    api_response.on('error', function (e) {
      console.error("❌ API response error:", e);
      response.writeHead(500, {'content-type': 'text/html'});
      response.end('<h1>Search Error</h1><a href="/">Try again</a>');
    });
    
    api_response.on("end", function () {
      try {
        const data = JSON.parse(body);
        
        if (!data.albums || !data.albums.items || data.albums.items.length === 0) {
          console.log("⚠️ No albums found");
          response.writeHead(200, {'content-type': 'text/html'});
          response.end(`
            <html>
              <head><title>No Results</title></head>
              <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1>😔 No albums found for "${user_input}"</h1>
                <p>Try searching for a different artist</p>
                <a href="/" style="color: #1db954; text-decoration: none; font-size: 18px;">← Search Again</a>
              </body>
            </html>
          `);
          return;
        }
        
        max_length = data.albums.items.length;
        console.log(`📀 Found ${max_length} albums`);
        
        // Ensure album-art directory exists
        const albumArtDir = './album-art';
        if (!fs.existsSync(albumArtDir)) {
          fs.mkdirSync(albumArtDir, { recursive: true });
        }
        
        // Download images for each album
        for (let i = 0; i < max_length; i++) {
          const album = data.albums.items[i];
          if (album.images && album.images.length > 0) {
            const imageUrl = album.images[0].url;
            const albumName = album.name || `album_${i}`;
            const artistName = album.artists && album.artists[0] ? album.artists[0].name : 'Unknown';
            
            download_album_image(imageUrl, albumName, artistName, i, response);
          } else {
            // No image available, use placeholder
            image_data[i] = {
              path: '',
              name: album.name || 'Unknown Album',
              artist: album.artists && album.artists[0] ? album.artists[0].name : 'Unknown Artist'
            };
            image_counter++;
            
            if (image_counter === max_length) {
              generate_webpage(response);
            }
          }
        }
        
      } catch (err) {
        console.error("❌ Error parsing search results:", err);
        response.writeHead(500, {'content-type': 'text/html'});
        response.end('<h1>Search Error</h1><p>Failed to parse results</p><a href="/">Try again</a>');
      }
    });
  });
  
  req.on('error', function(e) {
    console.error("❌ Search request error:", e);
    response.writeHead(500, {'content-type': 'text/html'});
    response.end('<h1>Network Error</h1><p>Could not search Spotify</p><a href="/">Try again</a>');
  });
  
  req.end();
};

const download_album_image = function(imageUrl, albumName, artistName, index, response) {
  console.log(`📥 Downloading image ${index + 1}/${max_length}: ${albumName}`);
  
  const image_req = https.get(imageUrl, function(image_response) {
    // Create safe filename
    const safeName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    const imagePath = `./album-art/${safeName}.jpeg`;
    
    const imageStream = fs.createWriteStream(imagePath);
    
    image_response.pipe(imageStream);
    
    imageStream.on("finish", function() {
      image_data[index] = {
        path: `/album-art/${safeName}.jpeg`,
        name: albumName,
        artist: artistName
      };
      
      image_counter++;
      console.log(`✅ Downloaded ${image_counter}/${max_length} images`);
      
      if (image_counter === max_length) {
        console.log("🎨 All images downloaded, generating webpage...");
        generate_webpage(response);
      }
    });
    
    imageStream.on("error", function(err) {
      console.error(`❌ Error saving image ${index}:`, err);
      // Continue anyway with placeholder
      image_data[index] = {
        path: '',
        name: albumName,
        artist: artistName
      };
      
      image_counter++;
      
      if (image_counter === max_length) {
        generate_webpage(response);
      }
    });
  });
  
  image_req.on('error', function(err) {
    console.error(`❌ Error downloading image ${index}:`, err);
    // Continue anyway with placeholder
    image_data[index] = {
      path: '',
      name: albumName,
      artist: artistName
    };
    
    image_counter++;
    
    if (image_counter === max_length) {
      generate_webpage(response);
    }
  });
};

const generate_webpage = function(response) {
  console.log("📄 Generating results webpage...");
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Search Results: ${current_user_input}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(135deg, #1db954, #191414);
          color: white;
          min-height: 100vh;
          padding: 2rem;
        }
        .header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .back-link {
          color: #1db954;
          text-decoration: none;
          font-size: 1.2rem;
          background: rgba(255,255,255,0.1);
          padding: 0.5rem 1rem;
          border-radius: 25px;
          transition: all 0.3s ease;
        }
        .back-link:hover {
          background: rgba(255,255,255,0.2);
        }
        .album-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .album-item {
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          padding: 1rem;
          text-align: center;
          transition: transform 0.3s ease;
        }
        .album-item:hover {
          transform: translateY(-5px);
        }
        .album-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 1rem;
        }
        .album-placeholder {
          width: 100%;
          height: 200px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          font-size: 3rem;
        }
        .album-name {
          font-weight: bold;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }
        .artist-name {
          opacity: 0.8;
          font-size: 0.9rem;
        }
        @media (max-width: 768px) {
          .album-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎵 "${current_user_input}" Albums</h1>
        <a href="/" class="back-link">← Search Again</a>
      </div>
      
      <div class="album-grid">
        ${image_data.map(album => `
          <div class="album-item">
            ${album.path ? 
              `<img src="${album.path}" alt="${album.name}" class="album-image" />` :
              `<div class="album-placeholder">🎵</div>`
            }
            <div class="album-name">${album.name}</div>
            <div class="artist-name">${album.artist}</div>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
  
  // Write to file and serve
  fs.writeFile('./album-request.html', html, (err) => {
    if (err) {
      console.error("❌ Error creating webpage:", err);
      response.writeHead(500, {'content-type': 'text/html'});
      response.end('<h1>Error creating results page</h1><a href="/">Try again</a>');
    } else {
      console.log("✅ Results webpage created successfully");
      response.writeHead(200, {'content-type': 'text/html'});
      response.end(html);
    }
  });
};

module.exports.search = search;