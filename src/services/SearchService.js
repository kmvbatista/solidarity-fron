import api from './api';

export const getNearNeedy = async (coords) => {
  try {
    const response = await api.get(
      `/search/necessity?latitude=${coords.latitude}&longitude=${coords.longitude}`,
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
    );
    return response.data;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data.error;
    }
  }
};
