export const getSrcFromFile = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.originFileObj);
    reader.onload = () => resolve(reader.result);
  });

export const onPreviewCompetitionCover = async (file) => {
  const src = file.url || (await getSrcFromFile(file));
  const imgWindow = window.open(src);

  if (imgWindow) {
    const image = new Image();
    image.src = src;
    imgWindow.document.write(image.outerHTML);
  } else {
    window.location.href = src;
  }
};
