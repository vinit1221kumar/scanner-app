import { PDFDocument } from 'pdf-lib';
import type { ScanImage } from '@/hooks/useScannerSocket';

function getImageFormat(dataUrl: string) {
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) {
    return 'jpeg' as const;
  }

  if (dataUrl.startsWith('data:image/png')) {
    return 'png' as const;
  }

  throw new Error('Unsupported image format. Only PNG and JPEG are supported.');
}

function dataUrlToBytes(dataUrl: string) {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) {
    throw new Error('Invalid image data.');
  }

  const base64 = dataUrl.slice(commaIndex + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export async function generatePdfFromImages(images: ScanImage[]) {
  const pdfDocument = await PDFDocument.create();

  for (const image of images) {
    const bytes = dataUrlToBytes(image.dataUrl);
    const format = getImageFormat(image.dataUrl);
    const embeddedImage = format === 'jpeg' ? await pdfDocument.embedJpg(bytes) : await pdfDocument.embedPng(bytes);

    const page = pdfDocument.addPage([embeddedImage.width, embeddedImage.height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height,
    });
  }

  return pdfDocument.save();
}
