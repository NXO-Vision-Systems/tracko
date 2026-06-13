export function getApiUrl(path: string): string {
  if (typeof window === "undefined") {
    return path;
  }
  const isCapacitor = window.location.protocol === "capacitor:" || 
                      window.location.protocol === "app:" || 
                      (window as any).Capacitor;
  const baseUrl = isCapacitor ? "https://tracko-nine.vercel.app" : "";
  return `${baseUrl}${path}`;
}
