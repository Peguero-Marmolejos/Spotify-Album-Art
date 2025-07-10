const fs = require('fs');
const path = require('path');

const authentication_cache = '../auth/authentication-res.json';

const create_access_token_cache = function (spotify_auth) {
  // Ensure the auth directory exists
  const authDir = path.dirname(authentication_cache);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  fs.writeFile(authentication_cache, JSON.stringify(spotify_auth, null, 2), (err) => {
    if (err) {
      console.error('❌ Cache creation error:', err);
    } else {
      console.log('💾 Authentication cache created successfully');
    }
  });
};

module.exports.cache = create_access_token_cache;