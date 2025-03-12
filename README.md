# DatoCMS Imgix Optimization Webhook

[![Next.js](https://img.shields.io/badge/Next.js-13.x-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![DatoCMS](https://img.shields.io/badge/DatoCMS-API-ff69b4)](https://www.datocms.com/)

## Overview

This project provides a serverless function that receives webhooks from DatoCMS when new uploads are created. For large images (>5MB), it automatically applies imgix optimization parameters, creates a new optimized version in your DatoCMS Media Library, and optionally can delete the original high-resolution upload.

The project also includes a commented-out implementation for directly replacing assets in-place (rather than creating duplicates), which can be enabled if needed.

### Key Features

- **Automatic Image Optimization**: Uses imgix parameters to optimize large images (>5MB)
- **Intelligent Optimization Logic**: Applies different optimization strategies based on image size and dimensions
- **DatoCMS Integration**: Creates new optimized uploads in your DatoCMS Media Library
- **Optional Original Deletion**: Can delete original high-resolution uploads after optimization (disabled by default)
- **Type Safety**: Built with TypeScript for better maintainability and developer experience

## How It Works

1. When a new image is uploaded to DatoCMS, it sends a webhook to your deployed endpoint
2. The webhook handler checks if the upload is an image and if it's larger than 5MB
3. If it meets the criteria, the handler:
   - Applies appropriate imgix optimization parameters (format, quality, size, etc.)
   - Creates a new upload in your DatoCMS Media Library with the optimized version
   - Optionally deletes the original high-resolution upload (disabled by default)

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

> 🔑 **Important**: You need a Full-Access API token from DatoCMS to allow the webhook to create new uploads and delete existing ones.

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

### Enabling Original Image Deletion

By default, the original high-resolution image is preserved. To enable deletion after optimization:

1. Open `pages/api/webhook.ts`
2. Find the commented section labeled "DELETION OF ORIGINAL UPLOAD"
3. Uncomment the code block

> ⚠️ **Warning**: This will permanently delete original high-resolution uploads. Make sure you've thoroughly tested the optimization process before enabling this feature.

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
  "newUploadId": "abc123",
  "originalDeleted": false
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

### "Failed to create new upload" Error

If you see this error in the logs, check:

1. Your DatoCMS API token has full access permissions
2. The token is correctly set in your environment variables
3. The imgix URL being generated is valid and accessible

### Webhook Not Triggering

If your webhook doesn't seem to be triggering, verify:

1. The webhook is correctly configured in DatoCMS
2. You've selected the "Upload created" event
3. Your deployment platform is not blocking incoming POST requests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for DatoCMS users