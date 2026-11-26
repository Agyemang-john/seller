/**
 * Photos finished in the Photo studio page, handed to the Add product form
 * ("Create a product with these photos"). Kept in memory only: a page reload
 * empties it, which is fine because the photos are still on the studio page.
 */
let waiting = [];

export function sendToNewProduct(files) { waiting = files.filter(Boolean); }

export function takeStudioPhotos() {
  const files = waiting;
  waiting = [];
  return files;
}
