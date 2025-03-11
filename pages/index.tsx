import type React from 'react';
import Head from 'next/head';

const Home: React.FC = () => {
  return (
    <div>
      <Head>
        <title>DatoCMS Webhook Handler</title>
        <meta name="description" content="A webhook handler for DatoCMS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>DatoCMS Webhook Handler</h1>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h2>About</h2>
          <p>This application receives and logs webhooks from DatoCMS.</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2>API Endpoint</h2>
          <p>The webhook endpoint is available at:</p>
          <pre style={{ backgroundColor: '#f4f4f4', padding: '1rem', borderRadius: '4px' }}>
            <code>/api/webhook</code>
          </pre>
        </div>

        <div>
          <h2>Usage</h2>
          <p>Configure your DatoCMS webhook to point to this endpoint.</p>
          <p>When events occur in DatoCMS, a webhook will be sent to this application and logged.</p>
        </div>
      </main>
    </div>
  );
};

export default Home;
