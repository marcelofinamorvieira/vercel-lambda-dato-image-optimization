// Vercel Lambda function to handle DatoCMS webhooks
export default async function handler(req, res) {
  // Only allow POST requests for webhooks
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST requests are accepted.' });
  }

  try {
    // Log the webhook payload from DatoCMS
    console.log('Received DatoCMS webhook:', JSON.stringify(req.body, null, 2));
    
    // Optional: Add additional processing or validation for the webhook
    // For example, you could verify the webhook signature if DatoCMS provides one
    
    // Return a successful response to DatoCMS
    return res.status(200).json({ 
      received: true, 
      message: 'Webhook successfully received and logged',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Log any errors that occur during processing
    console.error('Error processing DatoCMS webhook:', error);
    
    // Return an error response
    return res.status(500).json({ 
      received: false, 
      error: 'Failed to process webhook',
      message: error.message
    });
  }
}