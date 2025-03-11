/**
 * DatoCMS API Client Utility Module
 * 
 * This module provides utility functions for interacting with the DatoCMS Content Management API
 * using the official @datocms/cma-client-node library. It handles common operations like
 * creating uploads from URLs and deleting uploads.
 * 
 * @module datoCmsClient
 */

import { buildClient } from '@datocms/cma-client-node';

// Client instance is cached to avoid creating multiple connections
let clientInstance: ReturnType<typeof buildClient> | null = null;

/**
 * Get or initialize the DatoCMS client instance.
 * Uses a singleton pattern to reuse the same client connection across requests.
 * 
 * @returns {ReturnType<typeof buildClient>} The DatoCMS client instance
 * @throws {Error} If the DATOCMS_API_TOKEN environment variable is not set
 */
function getClient() {
  if (!clientInstance) {
    const apiToken = process.env.DATOCMS_API_TOKEN;
  
    if (!apiToken) {
      throw new Error('DATOCMS_API_TOKEN environment variable is not set');
    }

    clientInstance = buildClient({
      apiToken,
    });
  }
  
  return clientInstance;
}

/**
 * Creates a new upload in DatoCMS from a URL.
 * 
 * @param {string} url - The source URL to create an upload from
 * @param {string} [filename] - Optional custom filename for the upload
 * @returns {Promise<any>} The created upload object from DatoCMS
 * @throws {Error} If the upload creation fails
 */
export async function createUploadFromUrl(url: string, filename?: string) {
  console.log(`Creating DatoCMS upload from URL: ${url}`);
  
  try {
    // Get client instance
    const client = getClient();
    
    // Create upload from URL using the official client
    // The skipCreationIfAlreadyExists parameter is set to false to ensure
    // we create a new upload even if the same URL was previously uploaded
    const upload = await client.uploads.createFromUrl({
      url,
      skipCreationIfAlreadyExists: false,
      ...(filename ? { filename } : {}),
    });
    
    console.log('Upload created successfully:', upload);
    return upload;
  } catch (error) {
    console.error('Error creating upload:', error);
    throw error;
  }
}

/**
 * Gets details of an existing upload by its ID.
 * 
 * @param {string} uploadId - The ID of the upload to retrieve
 * @returns {Promise<any>} The upload object from DatoCMS
 */
export async function getUpload(uploadId: string) {
  const client = getClient();
  return client.uploads.find(uploadId);
}

/**
 * Deletes an upload from DatoCMS by its ID.
 * 
 * @param {string} uploadId - The ID of the upload to delete
 * @returns {Promise<boolean>} True if the deletion was successful
 * @throws {Error} If the deletion fails
 */
export async function deleteUpload(uploadId: string) {
  console.log(`Deleting DatoCMS upload with ID: ${uploadId}`);
  
  try {
    const client = getClient();
    await client.uploads.destroy(uploadId);
    console.log(`Successfully deleted upload with ID: ${uploadId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting upload with ID ${uploadId}:`, error);
    throw error;
  }
}
