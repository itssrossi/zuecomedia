export const extractSheetId = (url: string): string | null => {
  const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const fetchSheetData = async (sheetId: string, apiKey: string) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch sheet data');
  }
  
  const data = await response.json();
  return data.values || [];
};

export const detectColumns = (headers: string[]) => {
  const normalized = headers.map(h => h.toLowerCase().trim());
  
  return {
    email: normalized.findIndex(h => h.includes('email')),
    phone: normalized.findIndex(h => h.includes('phone') || h.includes('mobile')),
    firstName: normalized.findIndex(h => h.includes('first') && h.includes('name')),
    lastName: normalized.findIndex(h => h.includes('last') && h.includes('name')),
    company: normalized.findIndex(h => h.includes('company')),
  };
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Basic validation - should have at least 10 digits
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
};

export const formatPhoneE164 = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  // Add + prefix if not present
  return digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
};
