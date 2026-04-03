export function triggerDownload(href: string, fileName: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function downloadDataUrlAsImage(dataUrl: string, fileName: string) {
  triggerDownload(dataUrl, fileName);
}
