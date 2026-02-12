# Backend Configuration for Production Deployment

## Environment Variables

Create a `.env` file in the backend folder with:

```
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DATABASE_URL=your_database_connection_string
LOG_LEVEL=info
```

## Deployment Platforms

### Option 1: Heroku
```bash
heroku create mirror-app
heroku config:set NODE_ENV=production
git push heroku main
```

### Option 2: AWS Lambda + API Gateway
- Deploy with Serverless Framework
- Configure Lambda function
- Setup API Gateway

### Option 3: Google Cloud Run
```bash
gcloud run deploy mirror-backend --source .
```

### Option 4: Railway.app (Recommended for quick setup)
- Connect GitHub repo
- Auto-deploys on push
- Free tier available

### Option 5: Render
- Sign up at render.com
- Connect GitHub
- Create Web Service

## Database Migration
When ready, replace file-based storage with:
- MongoDB Atlas (free tier)
- PostgreSQL (AWS RDS free tier)
- Firebase Firestore

## Security Checklist
- [ ] Remove localhost references
- [ ] Add CORS whitelist
- [ ] Enable HTTPS only
- [ ] Add rate limiting
- [ ] Setup error logging (Sentry)
- [ ] Add authentication
- [ ] Enable GZIP compression
