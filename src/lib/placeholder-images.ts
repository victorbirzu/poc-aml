import placeholderData from './placeholder-images.json';

interface PlaceholderImage {
  id: string;
  src: string;
  alt: string;
  hint: string;
}

export const placeholderImages: PlaceholderImage[] =
  placeholderData.placeholderImages;

export function getPlaceholderImage(id: string): PlaceholderImage | undefined {
  return placeholderImages.find((img) => img.id === id);
}
