import axios from 'axios';
import {GOOGLE_API_KEY} from '../../Pages/config';

const fetchAddress = async (latitude: any, longitude: any) => {
  try {
    if (!latitude || !longitude) {
      throw new Error('Invalid latitude or longitude');
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          latlng: `${latitude},${longitude}`,
          key: GOOGLE_API_KEY,
        },
      },
    );

    if (response.data.status === 'OK') {
      const fetchedAddress = response.data.results[0].formatted_address;
      return {address: fetchedAddress, error: null};
    } else {
      return {address: null, error: 'Unable to fetch address'};
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    return {address: null, error: 'Error fetching address'};
  }
};

export default fetchAddress;
