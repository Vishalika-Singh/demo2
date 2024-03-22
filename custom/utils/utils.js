import { BASE_URL } from './config';

export const getScanTest = async (id, token) => {
  try {
    const response = await fetch(`${BASE_URL}/scanTests/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error fetching scan test:', error);
    throw error; // Re-throw the error to handle it outside
  }
};

export const assignToMe = async (id, token) => {
  try {
    const response = await fetch(`${BASE_URL}/scanReports/${id}/pick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error to handle it outside
  }
};
