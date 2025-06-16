export const cleanEmptyObjects = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      const cleanedArray = obj.map(item => cleanEmptyObjects(item)).filter(item => {
        if (item === null || item === undefined) return false;
        if (typeof item === 'object') {
          return Object.keys(item).length > 0;
        }
        return true;
      });
      return cleanedArray.length > 0 ? cleanedArray : null;
    }
    
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined || value === '') continue;
      
      const cleanedValue = cleanEmptyObjects(value);
      if (cleanedValue !== null && cleanedValue !== undefined) {
        if (typeof cleanedValue === 'object' && Object.keys(cleanedValue).length === 0) continue;
        cleaned[key] = cleanedValue;
      }
    }
    
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  };