# DatoCMS Webhook Logger

This is a simple Vercel serverless function that receives webhooks from DatoCMS and logs the payload.

## Setup Instructions

### 1. Deploy to Vercel

1. Push this code to a GitHub repository
2. Connect your repository to Vercel
3. During deployment, Vercel will automatically detect the serverless function

Alternatively, you can deploy directly using the Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel deploy
```

### 2. Configure DatoCMS Webhook

1. Go to your DatoCMS project
2. Navigate to Settings > Webhooks
3. Create a new webhook
4. Set the URL to your deployed Vercel function endpoint: `https://your-project.vercel.app/api/lambdafunction`
5. Select the events you want to trigger the webhook
6. Save the webhook configuration

## Function Details

This function will:
- Receive POST requests from DatoCMS
- Log the entire webhook payload
- Return a confirmation response to DatoCMS

## Customization

You can modify `lambdafunction.js` to process the webhook data according to your needs, such as:
- Sending notifications
- Triggering builds
- Updating external services
- Processing data changes

## Logs

To view logs from the webhooks, check your Vercel project dashboard under the "Functions" tab.
