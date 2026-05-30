export const resolveProfileImageUrl = (url?: string | null): string => {
  if (!url) return '';
  
  // If url is a legacy absolute URL containing localhost:5001, dynamically convert it to the current hostname
  if (url.includes('//localhost:5001')) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return url.replace('localhost:5001', `${hostname}:5001`);
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  const getApiBaseUrl = () => {
    if ((import.meta as any).env.VITE_API_BASE_URL) {
      return (import.meta as any).env.VITE_API_BASE_URL;
    }
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${hostname}:5001/api`;
  };

  const baseUrl = getApiBaseUrl();
  const origin = baseUrl.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};
