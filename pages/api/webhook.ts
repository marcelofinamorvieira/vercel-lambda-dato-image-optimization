/**
 * DatoCMS Webhook Handler with Imgix Optimization
 * 
 * This serverless function receives webhooks from DatoCMS, detects image uploads,
 * applies imgix optimization parameters, and optionally creates optimized versions
 * in the DatoCMS Media Library.
 *
 * @module webhook
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createUploadFromUrl, deleteUpload } from '../../utils/datoCmsClient';

/**
 * Response data interface for the webhook handler.
 * Contains information about the processed webhook and optimization results.
 */
interface WebhookResponse {
  received: boolean;            // Whether the webhook was successfully received
  message: string;             // Status message
  timestamp?: string;          // ISO timestamp of when the webhook was processed
  error?: string;              // Error message if applicable
  optimizedUrl?: string;       // The URL with imgix optimization parameters
  newUploadId?: string;        // ID of the newly created optimized upload
  originalDeleted?: boolean;   // Whether the original upload was deleted
}

/**
 * Interface for the image entity in the DatoCMS webhook payload.
 */
interface ImageEntity {
  id: string;                  // DatoCMS Upload ID
  type: string;                // Entity type (should be "upload")
  attributes: {
    size: number;              // File size in bytes
    width: number;             // Image width in pixels
    height: number;            // Image height in pixels
    url: string;               // Original image URL
    is_image: boolean;         // Whether the upload is an image
    filename?: string;         // Original filename
    [key: string]: unknown;    // Other attributes from DatoCMS
  };
  relationships: Record<string, unknown>; // Relationships with other entities
}

/**
 * Interface for the DatoCMS webhook payload.
 */
interface WebhookPayload {
  entity_type: string;         // Type of entity (e.g., "upload")
  event_type: string;          // Event type (e.g., "create", "update")
  entity: ImageEntity;         // The entity data
  [key: string]: unknown;      // Other fields from DatoCMS
}

/**
 * Extended NextApiRequest interface with typed body and method.
 */
interface ExtendedNextApiRequest extends NextApiRequest {
  method: string;             // HTTP method
  body: WebhookPayload;       // Webhook payload
}

/**
 * Applies imgix optimization parameters to an image URL based on its characteristics.
 * 
 * @param {string} imageUrl - The original image URL
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @param {number} size - Image file size in bytes
 * @returns {string} URL with imgix optimization parameters
 */
function applyImgixOptimizations(imageUrl: string, width: number, height: number, size: number): string {
  // Define size thresholds
  const LARGE_IMAGE_THRESHOLD = 5 * 1024 * 1024;      // 5MB
  const VERY_LARGE_IMAGE_THRESHOLD = 10 * 1024 * 1024; // 10MB
  
  // Start with base optimization parameters
  // auto=format: Automatically chooses the best format (WebP/AVIF)
  // compress: Applies intelligent compression
  let params = 'auto=format,compress';
  
  // Apply different optimization strategies based on image size
  if (size > LARGE_IMAGE_THRESHOLD) {
    // For large images (>5MB), apply more aggressive optimization
    // Lower quality (75%) that still maintains good visual appearance
    params += '&q=75';
    
    // If the image is very wide, resize it to a reasonable max width
    // This significantly reduces file size while keeping it usable for most applications
    if (width > 2000) {
      params += '&w=2000';
    }
    
    // Additional optimizations for very large images (>10MB)
    if (size > VERY_LARGE_IMAGE_THRESHOLD) {
      // Set device pixel ratio to 2 for high-resolution displays
      // This ensures the image still looks good on high-DPI screens
      params += '&dpr=2';
    }
  } else {
    // For smaller images, use lighter optimization with better quality
    params += '&q=85';
  }
  
  // Add parameters to the URL properly with ? or & separator
  if (imageUrl.includes('?')) {
    return `${imageUrl}&${params}`;
  }
  
  return `${imageUrl}?${params}`;
}

/**
 * Main webhook handler function.
 * Processes incoming webhooks from DatoCMS and handles image optimization.
 * 
 * @param {ExtendedNextApiRequest} req - The request object with webhook payload
 * @param {NextApiResponse} res - The response object
 * @returns {Promise<void>}
 */
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
    let newUploadId: string | undefined;
    const originalDeleted = false; // Whether the original upload was deleted
    
    // Check if the webhook is for an image upload
    if (
      req.body.entity_type === 'upload' && 
      req.body.entity?.attributes?.is_image === true
    ) {
      const { id: originalUploadId } = req.body.entity;
      const { size, width, height, url, filename } = req.body.entity.attributes;
      
      // Log original image details for diagnostics
      console.log(`Processing image: ${url}`);
      console.log(`Original size: ${(size / 1024 / 1024).toFixed(2)}MB, Dimensions: ${width}x${height}`);
      
      // Apply imgix optimizations based on image characteristics
      optimizedUrl = applyImgixOptimizations(url, width, height, size);
      
      // Log the optimized URL
      console.log(`Optimized image URL: ${optimizedUrl}`);
      
      // Only create a new upload if the image is larger than the threshold (5MB)
      // This avoids unnecessary processing for smaller images that don't need optimization
      if (size > 5 * 1024 * 1024) {
        try {
          // Create a new upload in DatoCMS with the optimized URL
          const uploadResponse = await createUploadFromUrl(
            optimizedUrl, 
            filename ? `optimized-${filename}` : undefined
          );
          
          if (uploadResponse?.id) {
            newUploadId = uploadResponse.id;
            console.log(`Created new optimized upload with ID: ${newUploadId}`);
            
            // ============================================================
            // DELETION OF ORIGINAL UPLOAD (COMMENTED OUT BY DEFAULT)
            // ============================================================
            // Uncomment the code below if you want to automatically delete the original upload
            // after creating an optimized version. This will permanently delete the original
            // high-resolution image from your DatoCMS Media Library.
            // 
            // IMPORTANT CONSIDERATIONS BEFORE ENABLING:
            // 1. Make sure you have tested the optimization process thoroughly
            // 2. Consider backing up your uploads before enabling this feature
            // 3. You might want to add additional checks (e.g. verifying the new upload exists)
            // 4. This operation is irreversible - the original upload will be permanently deleted
            //
            // try {
            //   // Delete the original upload
            //   await deleteUpload(originalUploadId);
            //   console.log(`Deleted original upload with ID: ${originalUploadId}`);
            //   originalDeleted = true;
            // } catch (deleteError) {
            //   console.error(`Failed to delete original upload with ID ${originalUploadId}:`, deleteError);
            // }
            // ============================================================
          }
        } catch (uploadError) {
          console.error('Failed to create new upload:', uploadError);
        }
      }
    }
    
    // Return a successful response to DatoCMS with processing results
    return res.status(200).json({ 
      received: true, 
      message: 'Webhook successfully received and processed',
      timestamp: new Date().toISOString(),
      optimizedUrl,
      newUploadId,
      originalDeleted
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
