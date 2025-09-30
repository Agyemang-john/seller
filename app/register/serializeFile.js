// utils/serializeFile.js
export function serializeFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function serializeFormData(data) {
  const serialized = { ...data };

  if (data.studentId instanceof File) {
    serialized.studentId = await serializeFile(data.studentId);
  }

  if (data.license instanceof File) {
    serialized.license = await serializeFile(data.license);
  }

  return serialized;
}
