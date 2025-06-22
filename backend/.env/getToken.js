const axios = require('axios');

async function getToken() {
  try {
    const response = await axios.post('https://carapi.app/api/auth/login', {
      // api_token: 'a2f9f09c-355e-4e43-8a70-8b6790844032',
      // api_secret: '7edd04657880f7858cc59a956e19441a',
      // api_token: 'f40eb6f0-835d-432f-bb7e-f40aad160dfb',
      // api_secret: '756d392d47d94381a641c474bf4ef491',
      api_token: '673248d1-f295-4594-990a-d55f21c3fbec',
      api_secret: '953754e3e106e445d3a71d1c1716edc8'
    }, {
      headers: {
        'accept': 'text/plain',
        'Content-Type': 'application/json',
      }
    });

    const data = response.data;  // ✅ axios response data is already parsed JSON or text
    console.log('Full response data:', data);
    return response.data.token;

  } catch (error) {
  if (error.response) {
    // The request was made and the server responded with a status code outside 2xx
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
  } else {
    // Something else happened
    console.error('Error:', error.message);
  }
  }
}

getToken();
