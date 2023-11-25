const mergeObjects = (obj1, obj2) => {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    throw new Error('Both inputs must be objects');
  }
  const mergedObj = { ...obj1 };
  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      if (
        typeof obj2[key] === 'object' &&
        Object.prototype.hasOwnProperty.call(obj1, key) &&
        typeof obj1[key] === 'object'
      ) {
        mergedObj[key] = mergeObjects(obj1[key], obj2[key]);
      } else {
        mergedObj[key] = obj2[key];
      }
    }
  }
  return mergedObj;
};

export const getConfig = async () => {
  try {
    const response = await fetch('/config');
    if (!response.ok) {
      throw new Error('No config.json provided. Using default.json');
    }
    const config = await response.json();
    if (config.mergeDefaults) {
      const defaultConfig = await fetch('/default.json').then(data => data.json());
      return mergeObjects(defaultConfig, config);
    }
    return config;
  } catch {
    return fetch('/default.json').then(data => data.json());
  }
};
