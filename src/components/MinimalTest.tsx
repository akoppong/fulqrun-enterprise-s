import React from 'react';

export function MinimalTest() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>✅ FulQrun CRM is Working!</h1>
      <p>This is a minimal test to verify the application is loading correctly.</p>
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '20px' 
      }}>
        <h2>🚀 Next Steps:</h2>
        <ul>
          <li>Verify login form is working</li>
          <li>Test collapsible sidebar functionality</li>
          <li>Check for any console errors</li>
        </ul>
      </div>
    </div>
  );
}