/**
 * Determines the media type (image or video) of a given URL.
 * @param {string} url - The URL to check.
 * @returns {Promise<string>} A promise that resolves to 'image', 'video', or 'unknown'.
 */
export async function determineMediaType(url) {
  try {
    // First, try to get the Content-Type header
    const response = await fetch(url, { method: "HEAD" });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const contentType = response.headers.get("content-type");

    if (contentType.startsWith("image/")) {
      return "image";
    } else if (contentType.startsWith("video/")) {
      return "video";
    }

    // If Content-Type is not conclusive, try to load the resource as a blob
    const blobResponse = await fetch(url);
    const blob = await blobResponse.blob();

    if (blob.type.startsWith("image/")) {
      return "image";
    } else if (blob.type.startsWith("video/")) {
      return "video";
    }

    // If we still can't determine the type, return 'unknown'
    return "unknown";
  } catch (error) {
    return "unknown";
  }
}

// Usage example:
// determineMediaType('https://example.com/media/file.jpg')
//   .then(type => console.log('Media type:', type))
//   .catch(error => console.error('Error:', error));
