# Twitch Autofarm Dashboard

A high-end dashboard for Twitch point farming, AI prediction betting, and Discord webhook logging with a cyberpunk/neon aesthetic.

## Features

- **Twitch Channel Point Farming**: Automatically collect channel points from multiple streams
- **AI-Powered Predictions**: Smart betting system using AI to predict outcomes
- **Multi-Stream Support**: Farm across multiple Twitch channels simultaneously
- **Discord Integration**: Real-time activity logs sent to Discord
- **Sleek Dashboard**: Modern cyberpunk interface with detailed analytics

## Deployment Instructions

### Deploying to Render.com

1. **Sign up for Render.com**
   - Create an account at [render.com](https://render.com)

2. **Deploy from GitHub**
   - Fork this repository to your GitHub account
   - In Render dashboard, click "New Web Service"
   - Connect your GitHub account and select the repository
   - Choose "Blueprint" as deployment method (Render will detect the `render.yaml` file)

3. **Environment Variables**
   - Set the following environment variables in Render's dashboard:
     - `NODE_ENV`: production
     - `PORT`: 10000 (or your preferred port)
     - `SESSION_SECRET`: (automatically generated)
     - `COOKIE_DOMAIN`: Your render app domain (e.g., your-app.onrender.com)
     - `VITE_API_BASE_URL`: (Optional) If your API and frontend are on different domains

4. **Verify Deployment**
   - Once deployed, visit your application at the URL provided by Render
   - Check the `/api/health` endpoint which should return a 200 status with `{status: "ok"}`

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd twitch-autofarm-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```
   PORT=5000
   SESSION_SECRET=your-local-secret-key
   # Add this only if API and frontend are on different domains
   # VITE_API_BASE_URL=http://your-api-domain.com
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Default Login

- Username: demo
- Password: password123

## Production Notes

- The application uses in-memory storage for all data, no external database required
- Session data is also stored in memory, which will be cleared on app restart
- Discord webhook rate limiting may occur during high activity