export const getConfig = async () => {
  try {
    const response = await fetch('/config');
    if (!response.ok) {
      throw new Error('No config.json available. Using default.json');
    }
    return response.json();
  } catch {
    return fetch('/default.json').then(data => data.json());
  }
};
