import React, { useState } from 'react';

const APIDebug = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testTotalUsersAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      console.log('Token:', token);
      
      const response = await fetch('http://localhost:3001/api/users/total-count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response Status:', response.status);
      const data = await response.json();
      console.log('Response Data:', data);
      setResult({
        status: response.status,
        data: data
      });
    } catch (error) {
      console.error('Error:', error);
      setResult({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>API Debug - Total Users Count</h2>
      <button onClick={testTotalUsersAPI} style={{ padding: '10px 20px', fontSize: '16px' }}>
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f5f5f5' }}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default APIDebug;
