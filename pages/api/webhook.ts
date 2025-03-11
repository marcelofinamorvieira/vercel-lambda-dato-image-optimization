// Vercel Lambda function to handle DatoCMS webhooks
import type { NextApiRequest, NextApiResponse } from 'next';

// Define interface for response data
interface WebhookResponse {
  received: boolean;
  message: string;
  timestamp?: string;
  error?: string;
  optimizedUrl?: string;
}

// Define interface for image entity in webhook payload
interface ImageEntity {
  id: string;
  type: string;
  attributes: {
    size: number;
    width: number;
    height: number;
    url: string;
    is_image: boolean;
    [key: string]: unknown;
  };
  relationships: Record<string, unknown>;
}

// Define interface for webhook payload
interface WebhookPayload {
  entity_type: string;
  event_type: string;
  entity: ImageEntity;
  [key: string]: unknown;
}

// Extend NextApiRequest to include the method property
interface ExtendedNextApiRequest extends NextApiRequest {
  method: string;
  body: WebhookPayload;
}

// Function to apply imgix optimizations to an image URL
function applyImgixOptimizations(imageUrl: string, width: number, height: number, size: number): string {
  // Size threshold in bytes (e.g., 5MB)
  const LARGE_IMAGE_THRESHOLD = 5 * 1024 * 1024;
  const VERY_LARGE_IMAGE_THRESHOLD = 10 * 1024 * 1024;
  
  // Base optimization parameters
  let params = 'auto=format,compress';
  
  // Apply different optimization levels based on image size
  if (size > LARGE_IMAGE_THRESHOLD) {
    // For large images, apply more aggressive optimization
    // Use a quality that balances size reduction and visual quality
    params += '&q=75';
    
    // If the image is very wide, consider resizing it
    if (width > 2000) {
      params += '&w=2000';
    }
    
    // Additional optimizations for very large images
    if (size > VERY_LARGE_IMAGE_THRESHOLD) {
      // More aggressive optimization for very large images while maintaining quality
      // Set dpr to 2 for high-resolution displays
      params += '&dpr=2';
    }
  } else {
    // For smaller images, use lighter optimization
    params += '&q=85';
  }
  
  // Add parameters to the URL
  if (imageUrl.includes('?')) {
    return `${imageUrl}&${params}`;
  }
  
  return `${imageUrl}?${params}`;
}

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<WebhookResponse | { error: string }>
): Promise<void> {
  // Only allow POST requests for webhooks
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST requests are accepted.' });
  }

  try {
    // Log the webhook payload from DatoCMS
    console.log('Received DatoCMS webhook:', JSON.stringify(req.body, null, 2));
    
    let optimizedUrl: string | undefined;
    
    // Check if the webhook is for an image upload
    if (
      req.body.entity_type === 'upload' && 
      req.body.entity?.attributes?.is_image === true
    ) {
      const { size, width, height, url } = req.body.entity.attributes;
      
      // Log original image details
      console.log(`Processing image: ${url}`);
      console.log(`Original size: ${(size / 1024 / 1024).toFixed(2)}MB, Dimensions: ${width}x${height}`);
      
      // Apply imgix optimizations
      optimizedUrl = applyImgixOptimizations(url, width, height, size);
      
      // Log the optimized URL
      console.log(`Optimized image URL: ${optimizedUrl}`);
    }
    
    // Return a successful response to DatoCMS
    return res.status(200).json({ 
      received: true, 
      message: 'Webhook successfully received and logged',
      timestamp: new Date().toISOString(),
      optimizedUrl
    });
  } catch (error) {
    // Log any errors that occur during processing
    console.error('Error processing DatoCMS webhook:', error);
    
    // Return an error response
    return res.status(500).json({ 
      received: false, 
      error: 'Failed to process webhook',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
