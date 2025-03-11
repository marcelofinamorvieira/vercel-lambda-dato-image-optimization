# DatoCMS Webhook Logger (TypeScript)

This is a simple Vercel serverless function built with TypeScript and Next.js that receives webhooks from DatoCMS and logs the payload.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Local Development

Run the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the home page.

The webhook endpoint will be available at: `http://localhost:3000/api/webhook`

### 3. Build for Production

```bash
npm run build
```

### 4. Deploy to Vercel

1. Push this code to a GitHub repository
2. Connect your repository to Vercel
3. During deployment, Vercel will automatically detect the serverless function

Alternatively, you can deploy directly using the Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel deploy
```

### 5. Configure DatoCMS Webhook

1. Go to your DatoCMS project
2. Navigate to Settings > Webhooks
3. Create a new webhook
4. Set the URL to your deployed Vercel function endpoint: `https://your-project.vercel.app/api/webhook`
5. Select the events you want to trigger the webhook
6. Save the webhook configuration

## Project Structure

```
/
├── pages/               # Next.js pages
│   ├── api/             # API routes
│   │   └── webhook.ts   # DatoCMS webhook handler
│   └── index.tsx        # Home page
├── tsconfig.json        # TypeScript configuration
├── next-env.d.ts        # Next.js TypeScript definitions
└── package.json         # Project dependencies
```

## Function Details

This function will:
- Receive POST requests from DatoCMS
- Log the entire webhook payload
- Return a confirmation response to DatoCMS

## TypeScript Benefits

This project uses TypeScript for:  
- Type-safe API endpoints with Next.js
- Better developer experience with autocompletion
- More robust error handling
- Better maintainability with clearly defined interfaces

## Customization

You can modify `pages/api/webhook.ts` to process the webhook data according to your needs, such as:
- Sending notifications
- Triggering builds
- Updating external services
- Processing data changes

## Logs

To view logs from the webhooks, check your Vercel project dashboard under the "Functions" tab.

When running locally, logs will appear in your terminal console.
