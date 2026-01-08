# Deployment Guide

This guide covers various deployment options for the SA-DASH application.

## 📦 Deployment Options

### 1. GitHub Pages (Recommended)

GitHub Pages is the easiest way to deploy SA-DASH as a static site.

#### Setup Steps

1. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select branch: `main`
   - Select folder: `/ (root)`
   - Click "Save"

2. **Access your site:**
   - URL: `https://YOUR-USERNAME.github.io/sa-dash/`
   - Wait 1-2 minutes for deployment

3. **Custom Domain (Optional):**
   - Add a `CNAME` file with your domain
   - Configure DNS settings with your registrar
   - Update GitHub Pages settings

#### GitHub Actions (Auto-deploy)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          publish_branch: gh-pages
```

### 2. Netlify

Netlify offers continuous deployment and custom domains.

#### Setup Steps

1. **Sign up** at [netlify.com](https://netlify.com)
2. **Connect repository:**
   - Click "New site from Git"
   - Select GitHub and authorize
   - Choose `sa-dash` repository

3. **Configure build:**
   - Build command: (leave empty)
   - Publish directory: `/`
   - Click "Deploy site"

4. **Custom domain:**
   - Go to "Domain settings"
   - Add custom domain
   - Update DNS records

#### netlify.toml

Create `netlify.toml` for configuration:

```toml
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 3. Vercel

Vercel provides fast global CDN deployment.

#### Setup Steps

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow prompts:**
   - Link to existing project or create new
   - Confirm project settings
   - Deploy

#### vercel.json

Create `vercel.json`:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 4. Self-Hosted (Apache)

Deploy on your own Apache web server.

#### Setup Steps

1. **Upload files:**
   ```bash
   scp -r sa-dash/ user@server:/var/www/html/sa-dash/
   ```

2. **Configure Apache:**

   Create `/etc/apache2/sites-available/sa-dash.conf`:
   ```apache
   <VirtualHost *:80>
       ServerName sa-dash.example.com
       DocumentRoot /var/www/html/sa-dash
       
       <Directory /var/www/html/sa-dash>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       ErrorLog ${APACHE_LOG_DIR}/sa-dash-error.log
       CustomLog ${APACHE_LOG_DIR}/sa-dash-access.log combined
   </VirtualHost>
   ```

3. **Enable site:**
   ```bash
   sudo a2ensite sa-dash
   sudo systemctl reload apache2
   ```

4. **SSL (Recommended):**
   ```bash
   sudo certbot --apache -d sa-dash.example.com
   ```

### 5. Self-Hosted (Nginx)

Deploy on Nginx web server.

#### Setup Steps

1. **Upload files:**
   ```bash
   scp -r sa-dash/ user@server:/var/www/sa-dash/
   ```

2. **Configure Nginx:**

   Create `/etc/nginx/sites-available/sa-dash`:
   ```nginx
   server {
       listen 80;
       server_name sa-dash.example.com;
       root /var/www/sa-dash;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
       
       # Security headers
       add_header X-Frame-Options "DENY";
       add_header X-Content-Type-Options "nosniff";
       add_header X-XSS-Protection "1; mode=block";
       
       # Caching
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Enable site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/sa-dash /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **SSL (Recommended):**
   ```bash
   sudo certbot --nginx -d sa-dash.example.com
   ```

### 6. Docker Container

Run SA-DASH in a Docker container.

#### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM nginx:alpine

# Copy application files
COPY . /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    
    # Caching
    location ~* \.(js|css)$ {
        expires 1h;
    }
}
```

#### Build and Run

```bash
# Build image
docker build -t sa-dash .

# Run container
docker run -d -p 8080:80 --name sa-dash sa-dash

# Access at http://localhost:8080
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  sa-dash:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## 🔒 Security Considerations

### CORS Proxies

The application uses CORS proxies for fetching external data. In production:

1. **Consider running your own proxy server** for better security and reliability
2. **Rate limit** your proxy to prevent abuse
3. **Monitor** proxy usage and costs
4. **Whitelist** specific data sources

### Content Security Policy

Add CSP headers for enhanced security:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://d3js.org https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:;">
```

### Environment Variables

For sensitive configuration:

1. **Never commit** API keys or secrets
2. **Use environment variables** for sensitive data
3. **Implement a backend** if you need to hide keys

## 🚀 Performance Optimization

### Production Checklist

- [ ] Enable gzip compression
- [ ] Set appropriate cache headers
- [ ] Minify JavaScript and CSS (optional)
- [ ] Optimize images
- [ ] Enable CDN if available
- [ ] Monitor performance with Lighthouse

### Caching Strategy

```nginx
# Static assets - cache for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML - no cache
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## 📊 Monitoring

### Health Checks

Monitor your deployment:
- Check if site is accessible
- Verify data is loading
- Monitor CORS proxy status
- Check browser console for errors

### Analytics (Optional)

Consider adding:
- Google Analytics
- Plausible Analytics (privacy-friendly)
- Simple server logs analysis

## 🔄 Updates

### Update Process

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Test locally:**
   ```bash
   npm run dev
   ```

3. **Deploy:**
   - GitHub Pages: Push to main branch
   - Netlify/Vercel: Push triggers auto-deploy
   - Self-hosted: Upload new files
   - Docker: Rebuild and restart container

## 📞 Support

For deployment issues:
- Check [GitHub Issues](https://github.com/cywf/sa-dash/issues)
- Review deployment provider documentation
- Check browser console for errors

---

**Happy Deploying! 🚀**
