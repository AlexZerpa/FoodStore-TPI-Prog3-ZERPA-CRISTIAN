export function navigate(path: string): void {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  window.location.href = cleanPath;
}