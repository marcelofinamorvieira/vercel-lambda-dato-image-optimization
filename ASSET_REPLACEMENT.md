# Asset Replacement Functionality

## Overview

This project includes an alternative implementation for handling image optimization in DatoCMS. Instead of creating duplicate optimized images, it can replace the original assets in-place while preserving all relationships and references.

## Features

- **In-place Replacement**: Updates the original asset rather than creating duplicates
- **Relationship Preservation**: All content references to the original asset remain intact
- **DatoCMS API Integration**: Uses the DatoCMS API with proper versioning (X-Api-Version: 3)
- **Robust Error Handling**: Falls back to the original approach if replacement fails

## How to Enable

The asset replacement functionality is currently disabled (commented out). To enable it:

1. Open `pages/api/webhook.ts`
2. Uncomment the import for `replaceAssetFromUrl` at the top of the file
3. In the image processing section, uncomment the asset replacement code block
4. Comment out or remove the existing `createUploadFromUrl` implementation

## Technical Implementation

The asset replacement uses DatoCMS's API to:

1. Create an upload request to get a pre-signed S3 URL
2. Fetch the optimized image from the imgix URL
3. Upload the optimized image to S3
4. Update the original asset's metadata to point to the new file

This approach maintains a single asset in your DatoCMS Media Library while still getting the benefits of optimization.
