export function formatCurrency(amount: number, currency: string = 'USD', decimals: number = 2): string {
  if (amount < 0.01 && amount > 0) {
    // Format sub-cent fractional amounts with up to 6 decimals
    return `$${amount.toFixed(5)}`;
  }
  
  if (currency === 'JPY') {
    return `¥${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  if (currency === 'EUR') {
    return `€${amount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }

  if (currency === 'GBP') {
    return `£${amount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }

  if (currency === 'SGD') {
    return `S$${amount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }

  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatSubCent(amount: number): string {
  if (amount < 0.0001) {
    return `$${amount.toFixed(6)}`;
  }
  if (amount < 0.01) {
    return `$${amount.toFixed(4)}`;
  }
  return `$${amount.toFixed(2)}`;
}

export function truncateHash(hash: string, startLen: number = 8, endLen: number = 6): string {
  if (!hash) return '';
  if (hash.length <= startLen + endLen) return hash;
  return `${hash.slice(0, startLen)}...${hash.slice(-endLen)}`;
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
