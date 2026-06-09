const SUPPORTED_BITMAP_TYPES = /^image\/(?:jpeg|png|webp|bmp)$/;

const readFileAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const loadWithImageBitmap = async (file) => {
  const buffer = await readFileAsArrayBuffer(file);
  const blob = new Blob([buffer], { type: file.type });
  const imageBitmap = await createImageBitmap(blob);
  return {
    image: imageBitmap,
    dimensions: { width: imageBitmap.width, height: imageBitmap.height },
  };
};

const loadWithImageElement = async (file) => {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
  return {
    image,
    dimensions: { width: image.width, height: image.height },
  };
};

export const loadImageFromFile = async (file) => {
  if ('createImageBitmap' in window && SUPPORTED_BITMAP_TYPES.test(file.type)) {
    return loadWithImageBitmap(file);
  }
  return loadWithImageElement(file);
};
