# Spotify Album Art Viewer

Interactive web application for searching and displaying album artwork using the Spotify Web API. Built with Node.js and vanilla JavaScript, featuring OAuth 2.0 authentication and real-time search functionality.

## 🎵 Live Demo

![Spotify Demo](assets/demo-preview.gif)
*Search for your favorite artists and discover their album artwork*

## ✨ Features

- **OAuth 2.0 Authentication** - Secure integration with Spotify Web API
- **Real-time Artist Search** - Instant search results as you type
- **Responsive Grid Layout** - Beautiful album artwork display
- **Image Caching** - Optimized performance with local image storage
- **Error Handling** - Robust error management for API failures
- **Modern UI Design** - Clean, professional interface with smooth animations
- **Token Management** - Automatic token refresh and caching

## 🛠️ Technologies Used

- **Backend**: Node.js, HTTPS module
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: Spotify Web API
- **Authentication**: OAuth 2.0 Client Credentials Flow
- **Styling**: CSS Grid, Flexbox, Custom Properties

## 🚀 Getting Started

### Prerequisites

- Node.js (v12 or higher)
- Spotify Developer Account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/peguero-marmolejos/Spotify-Album-Art.git
   cd Spotify-Album-Art
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Spotify API credentials**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app or use an existing one
   - Copy your `Client ID` and `Client Secret`
   - Create `auth/credentials.json`:
   ```json
   {
     "client_id": "your_spotify_client_id_here",
     "client_secret": "your_spotify_client_secret_here"
   }
   ```

4. **Run the application**
   ```bash
   npm start
   ```
   or
   ```bash
   node index.js
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
Spotify-Album-Art/
├── index.js                    # Main server file
├── package.json               # Project dependencies
├── search-form.html           # Search interface
├── js/
│   ├── authRequest.js         # OAuth authentication handler
│   ├── cache_creator.js       # Token caching system
│   └── spotify_search.js      # Search functionality and UI generation
├── auth/
│   ├── credentials.json       # Spotify API credentials (not tracked)
│   └── authentication-res.json # Cached auth tokens
├── album-art/                 # Downloaded album images (auto-generated)
└── README.md                  # Project documentation
```

## 🎯 How It Works

1. **Authentication**: App requests access token from Spotify using Client Credentials flow
2. **Token Caching**: Valid tokens are cached locally to minimize API calls
3. **Search Process**: User input triggers real-time search via Spotify Web API
4. **Image Processing**: Album artwork is downloaded and cached locally
5. **UI Generation**: Dynamic HTML page is created displaying search results

## 🔧 Configuration

### Environment Variables (Optional)

For production deployment, you can use environment variables instead of the credentials file:

```bash
export SPOTIFY_CLIENT_ID="your_client_id"
export SPOTIFY_CLIENT_SECRET="your_client_secret"
```

### Port Configuration

Default port is `3000`. To change:

```javascript
const port = process.env.PORT || 3000;
```

## 🎨 API Endpoints

- **GET /** - Serves the search form
- **GET /search?q={artist}** - Searches for artist and returns album grid
- **GET /album-art/{filename}** - Serves cached album artwork
- **GET /results** - Displays generated results page

## 🧪 Testing

### Manual Testing

1. Start the server: `node index.js`
2. Visit `http://localhost:3000`
3. Try searching for popular artists:
   - "Pink Floyd"
   - "Taylor Swift"
   - "The Beatles"
   - "Adele"

### Expected Behavior

- Search should return grid of album artwork
- Images should load and cache locally
- Error handling for invalid artists
- Responsive design on mobile devices

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production Considerations
- Use environment variables for credentials
- Implement rate limiting
- Add HTTPS in production
- Consider using a process manager like PM2

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for providing access to music data
- [Spotify Developer Documentation](https://developer.spotify.com/documentation/) for comprehensive API guides

## 🐛 Known Issues

- Large GIF files may affect loading performance
- Token expiration requires manual restart (future enhancement planned)
- Limited to 20 albums per search (Spotify API default)

## 🔮 Future Enhancements

- [ ] Add artist biography integration
- [ ] Implement playlist creation functionality
- [ ] Add music preview playback
- [ ] Create user authentication for personalized features
- [ ] Add album details modal with track listings
- [ ] Implement infinite scroll for more results

## 📞 Contact

**Emily Peguero Marmolejos**
- GitHub: [@peguero-marmolejos](https://github.com/peguero-marmolejos)
- LinkedIn: [Emily Peguero Marmolejos](https://www.linkedin.com/in/peguero-marmolejos/)
- Email: erpegueromarmolejos@gmail.com

---

⭐ **If you found this project helpful, please give it a star!** ⭐