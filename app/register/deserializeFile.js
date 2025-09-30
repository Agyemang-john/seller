// utils/deserializeFile.js
export function deserializeFile(data) {
  if (!data?.dataUrl) return null;

  const byteString = atob(data.dataUrl.split(",")[1]);
  const mimeString = data.dataUrl.split(",")[0].split(":")[1].split(";")[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new File([ab], data.name, { type: mimeString });
}
