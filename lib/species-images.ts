const LEGACY_WIKIMEDIA_THUMBNAIL = "/440px-";
const SUPPORTED_WIKIMEDIA_THUMBNAIL = "/500px-";

export function getSpeciesImageUrl(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);

    if (url.hostname === "upload.wikimedia.org" && url.pathname.includes(LEGACY_WIKIMEDIA_THUMBNAIL)) {
      url.pathname = url.pathname.replace(LEGACY_WIKIMEDIA_THUMBNAIL, SUPPORTED_WIKIMEDIA_THUMBNAIL);
      return url.toString();
    }
  } catch {
    return imageUrl;
  }

  return imageUrl;
}
