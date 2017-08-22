(function () {
  const imageLoader = document.querySelector('#imageLoader');
  const canvas = document.getElementById('imageContainer');
  const context = canvas.getContext('2d');

  let sourceImage;

  /**
   * Image loading
   */
  imageLoader.onchange = () => {
    const file = imageLoader.files[0];
    const reader = new FileReader();

    sourceImage = new Image();

    sourceImage.onload = function() {
      const imageWidth = this.width;
      const imageHeight = this.height;
      const canvasWidth = this.width / 2;
      const canvasHeight = this.height / 2;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      context.drawImage(this, 0, 0, imageWidth, imageHeight, 0, 0, canvasWidth, canvasHeight);
    };

    reader.onloadend = function () {
      sourceImage.src = reader.result;
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  /**
   * Filters impl
   */
  const rotationFilter = document.querySelector('#rotationFilter');
  const brightnessFilter = document.querySelector('#brightnessFilter');
  const contrastFilter = document.querySelector('#contrastFilter');

  function applyFilters() {
    if (!sourceImage) {
      return;
    }

    const rotationFilterValue = Number(rotationFilter.value);
    const rotatedPixels = applyRotationFilter(sourceImage, rotationFilterValue);

    const brightnessFilterValue = Number(brightnessFilter.value);
    const brightnessFilteredPixels = applyBrightnessFilter(rotatedPixels, brightnessFilterValue);

    const contrastFilterValue = Number(contrastFilter.value);
    const contrastFilteredPixels = applyContrastFilter(brightnessFilteredPixels, contrastFilterValue);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.putImageData(contrastFilteredPixels, 0, 0);
  }

  function applyContrastFilter(imageData, adjustment) {
    if (adjustment === 0) {
      return imageData;
    }

    const pixels = imageData.data;
    const factor = (259 * (adjustment + 255)) / (255 * (259 - adjustment));

    for(let i = 0; i < pixels.length; i += 4)
    {
      pixels[i] = factor * (pixels[i] - 128) + 128;
      pixels[i+1] = factor * (pixels[i+1] - 128) + 128;
      pixels[i+2] = factor * (pixels[i+2] - 128) + 128;
    }

    return imageData;
  }

  function applyBrightnessFilter(imageData, adjustment) {
    if (adjustment === 0) {
      return imageData;
    }

    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] += adjustment;
      pixels[i + 1] += adjustment;
      pixels[i + 2] += adjustment;
    }

    return imageData;
  }

  function applyRotationFilter(image, adjustment) {
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');

    const imageWidth = canvas.width * 2;
    const imageHeight = canvas.height * 2;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;

    tempContext.save();
    tempContext.translate(canvasWidth / 2, canvasHeight / 2);
    tempContext.rotate(adjustment * Math.PI / 180);
    tempContext.translate(-canvasWidth / 2, -canvasHeight / 2);

    tempContext.drawImage(image, 0, 0, imageWidth, imageHeight, 0, 0, canvasWidth, canvasHeight);
    tempContext.restore();

    const pixelsArray = tempContext.getImageData(0, 0, canvasWidth, canvasHeight);

    return pixelsArray;
  }

  /**
   * On filters range change
   */
  rotationFilter.oninput = applyFilters;
  brightnessFilter.oninput = applyFilters;
  contrastFilter.oninput = applyFilters;
})();