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
// Import is commented out as the functionality is disabled
// import replaceAssetFromUrl from '../../utils/assetReplacer';

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
  assetReplaced?: boolean;     // Whether the original asset was replaced with an optimized version
  newUploadId?: string;        // ID of the newly created optimized upload (legacy approach)
  originalDeleted?: boolean;   // Whether the original upload was deleted (legacy approach)
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
    // Asset replacement is disabled, so this is always false
    const assetReplaced = false;
    const originalDeleted = false; // Keeping this for backward compatibility
    
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
      
      // Only process optimization for images larger than the threshold (5MB)
      // This avoids unnecessary processing for smaller images that don't need optimization
      if (size > 5 * 1024 * 1024) {
        try {
          // Replace the original asset with the optimized version
          // instead of creating a new one and deleting the original
          // const replacementResult = await replaceAssetFromUrl(
          //   originalUploadId,
          //   optimizedUrl,
          //   filename ? `optimized-${filename}` : undefined
          // );
          
          // if (replacementResult?.data?.id) {
          //   assetReplaced = true;
          //   console.log(`Successfully replaced asset with ID: ${replacementResult.data.id} with optimized version`);
          // }
        } catch (replacementError) {
          // console.error('Failed to replace asset with optimized version:', replacementError);
          
          // // Fallback to the old approach of creating a new upload if replacement fails
          // try {
          //   // Create a new upload in DatoCMS with the optimized URL
          //   const uploadResponse = await createUploadFromUrl(
          //     optimizedUrl, 
          //     filename ? `optimized-${filename}` : undefined
          //   );
            
          //   if (uploadResponse?.id) {
          //     newUploadId = uploadResponse.id;
          //     console.log(`Created new optimized upload with ID: ${newUploadId}`);
              
          //     // The original deletion code is kept commented out for backward compatibility
          //     // try {
          //     //   // Delete the original upload
          //     //   await deleteUpload(originalUploadId);
          //     //   console.log(`Deleted original upload with ID: ${originalUploadId}`);
          //     //   originalDeleted = true;
          //     // } catch (deleteError) {
          //     //   console.error(`Failed to delete original upload with ID ${originalUploadId}:`, deleteError);
          //     // }
          //   }
          // } catch (uploadError) {
          //   console.error('Failed to create new upload as fallback:', uploadError);
          // }
        }
      }
    }
    
    // Return a successful response to DatoCMS with processing results
    return res.status(200).json({ 
      received: true,
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString(),
      optimizedUrl,
      assetReplaced,
      newUploadId,
      originalDeleted,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ 
      received: true, 
      message: 'Error processing webhook', 
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}
