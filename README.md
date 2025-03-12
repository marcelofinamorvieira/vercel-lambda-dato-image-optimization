# DatoCMS Imgix Optimization Webhook

[![Next.js](https://img.shields.io/badge/Next.js-13.x-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![DatoCMS](https://img.shields.io/badge/DatoCMS-API-ff69b4)](https://www.datocms.com/)

## Overview

This project provides a serverless function that receives webhooks from DatoCMS when new uploads are created. For large images (>5MB), it automatically applies imgix optimization parameters and replaces the original assets in-place while preserving all relationships and references.

### Key Features

- **Automatic Image Optimization**: Uses imgix parameters to optimize large images (>5MB)
- **Intelligent Optimization Logic**: Applies different optimization strategies based on image size and dimensions
- **In-place Replacement**: Updates the original asset rather than creating duplicates
- **Relationship Preservation**: All content references to the original asset remain intact
- **DatoCMS API Integration**: Uses the DatoCMS API with proper versioning (X-Api-Version: 3)
- **Robust Error Handling**: Falls back to the original approach if replacement fails
- **Type Safety**: Built with TypeScript for better maintainability and developer experience

## How It Works

1. When a new image is uploaded to DatoCMS, it sends a webhook to your deployed endpoint
2. The webhook handler checks if the upload is an image and if it's larger than 5MB
3. If it meets the criteria, the handler:
   - Applies appropriate imgix optimization parameters (format, quality, size, etc.)
   - Replaces the original asset with the optimized version using DatoCMS's API

## Technical Implementation

The asset replacement uses DatoCMS's API to:

1. Create an upload request to get a pre-signed S3 URL
2. Fetch the optimized image from the imgix URL
3. Upload the optimized image to S3
4. Update the original asset's metadata to point to the new file

This approach maintains a single asset in your DatoCMS Media Library while still getting the benefits of optimization.

## Setup Instructions

### Prerequisites

- Node.js 14.x or later
- npm or yarn
- A DatoCMS account
- A deployment platform (Vercel recommended)

### Installation

1. Clone this repository:

```bash
git clone <repository-url>
cd imgixoptimization
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on the `.env.example`:

```bash
cp .env.example .env
```

4. Add your DatoCMS API token to the `.env` file:

```
DATOCMS_API_TOKEN=your_datocms_full_access_api_token
```

> 🔑 **Important**: You need a Full-Access API token from DatoCMS to allow the webhook to create new uploads and replace existing ones.

### Local Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

The webhook endpoint will be available at: `http://localhost:3000/api/webhook`

To test locally, you'll need to use a tunneling service like [ngrok](https://ngrok.com/) to expose your local server to the internet:

```bash
ngrok http 3000
```

Use the provided ngrok URL in your DatoCMS webhook settings.

## Deployment

### Deploy to Vercel (Recommended)

1. Push this code to a Git repository (GitHub, GitLab, etc.)
2. Import the project in Vercel
3. Add the `DATOCMS_API_TOKEN` environment variable in the Vercel project settings
4. Deploy the project

Alternatively, you can deploy directly using the Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel
```

### Other Deployment Options

This project can be deployed to any platform that supports Next.js API routes, including:

- Netlify
- AWS Lambda
- Google Cloud Functions
- Azure Functions

Follow the respective platform's instructions for deploying Next.js API routes.

## Configuring DatoCMS Webhook

1. Go to your DatoCMS project dashboard
2. Navigate to Settings > Webhooks
3. Create a new webhook
4. Set the URL to your deployed function endpoint (e.g., `https://your-project.vercel.app/api/webhook`)
5. Select the "Upload created" event
6. Save the webhook configuration

## Customization

### Adjusting Optimization Logic

To modify the optimization logic, edit the `applyImgixOptimizations` function in `pages/api/webhook.ts`. You can adjust:

- Size thresholds for detecting large images
- Quality settings
- Resizing logic
- Additional imgix parameters

### Disabling Asset Replacement

The asset replacement functionality is enabled by default. If you want to disable it to compare original vs. optimized images or refine your optimization strategy:

1. Open `pages/api/webhook.ts`
2. Comment out the asset replacement code block (around line 170)
3. You can also modify the optimization parameters in the `applyImgixOptimizations` function to experiment with different settings
4. To view both versions side by side, temporarily disable replacement while keeping the optimization URL generation

This approach allows you to fine-tune the optimization process before committing to permanent asset replacements.

## Monitoring and Debugging

### Logs

If deployed to Vercel, you can view logs in the Vercel dashboard under the Functions tab.

When running locally, logs will appear in your terminal console.

### Response Format

The webhook handler returns a JSON response with information about the processed webhook:

```json
{
  "received": true,
  "message": "Webhook successfully received and processed",
  "timestamp": "2023-04-12T15:30:45.123Z",
  "optimizedUrl": "https://www.datocms-assets.com/123/image.jpg?auto=format,compress&q=75",
  "assetReplaced": true
}
```

## Technical Details

### Project Structure

```
/
├── pages/                # Next.js pages
│   ├── api/              # API routes
│   │   └── webhook.ts    # DatoCMS webhook handler
├── utils/
│   ├── assetReplacer.ts  # Asset replacement functionality
│   └── datoCmsClient.ts  # DatoCMS API client utilities
├── .env                  # Environment variables (not in git)
├── .env.example         # Example environment variables
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

### Technology Stack

- **Next.js**: React framework with API routes for serverless functions
- **TypeScript**: For type safety and better developer experience
- **@datocms/cma-client-node**: Official DatoCMS Content Management API client
- **imgix**: Dynamic image processing service (used via URL parameters)

## Common Issues

### "Failed to replace asset" Error

If you see this error in the logs, check:

1. Your DatoCMS API token has full access permissions
2. The asset ID is valid and exists in your DatoCMS project
3. The optimized image URL is accessible
