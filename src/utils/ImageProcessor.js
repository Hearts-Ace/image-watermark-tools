// src/utils/ImageProcessor.js
import * as logos from './logos.js';

const processImage = (canvas, image, settings, exifData, options = {}) => {
  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d');
    const isPreview = options.mode === 'preview';
    
    // 获取设备像素比，以支持高分辨率显示器
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // 根据选择的输出分辨率设置maxWidth
    let maxWidth;
    switch (settings.outputResolution) {
      case 'original':
        // 原始尺寸严格使用上传图片原生像素宽度
        maxWidth = image.width;
        break;
      case 'high':
        maxWidth = 9000;
        break;
      case 'medium':
        maxWidth = 5000;
        break;
      case 'low':
        maxWidth = 3000;
        break;
      default:
        maxWidth = image.width;
    }

    // 预览模式使用轻量分辨率，避免实时调节时卡顿
    if (isPreview) {
      maxWidth = Math.min(maxWidth, 1800);
    }
    
    // Calculate dimensions - 使用选定的分辨率
    const aspectRatio = image.width / image.height;
    const width = Math.min(image.width, maxWidth);
    const height = width / aspectRatio;
    const uiScale = Math.max(1, width / 1200);
    const scaledSettings = {
      ...settings,
      topBorder: (settings.topBorder || 0) * uiScale,
      rightBorder: (settings.rightBorder || 0) * uiScale,
      bottomBorder: (settings.bottomBorder || 0) * uiScale,
      leftBorder: (settings.leftBorder || 0) * uiScale,
      borderRadius: (settings.borderRadius || 0) * uiScale,
      colorStripTopOffset: (settings.colorStripTopOffset ?? settings.bottomBorder ?? 0) * uiScale
    };
    const rotationAngle = settings.rotationAngle || 0;
    const rotationRadians = (rotationAngle * Math.PI) / 180;

    // 旋转后外接矩形尺寸，确保图片不被裁切
    const absCos = Math.abs(Math.cos(rotationRadians));
    const absSin = Math.abs(Math.sin(rotationRadians));
    const rotatedWidth = width * absCos + height * absSin;
    const rotatedHeight = width * absSin + height * absCos;

    // Set canvas size including borders
    const totalWidth = rotatedWidth + scaledSettings.leftBorder + scaledSettings.rightBorder;
    const totalHeight = rotatedHeight + scaledSettings.topBorder + scaledSettings.bottomBorder;
    
    // 设置canvas尺寸时考虑设备像素比，以支持高分辨率显示
    canvas.width = totalWidth * devicePixelRatio;
    canvas.height = totalHeight * devicePixelRatio;
    
    // 调整canvas的CSS尺寸 - 修复界面显示问题
    canvas.style.width = '100%'; // 使用100%宽度，而不是固定像素
    canvas.style.height = 'auto';
    canvas.style.maxWidth = '100%'; // 确保canvas不会超出其容器
    canvas.style.display = 'block'; // 块级显示
    canvas.style.margin = '0 auto'; // 水平居中
    
    // 缩放上下文以匹配设备像素比
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // 设置图像平滑属性 - 启用高质量平滑以获得更好的缩放效果
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    const radius = Math.min(
      scaledSettings.borderRadius || 0,
      scaledSettings.topBorder || 0,
      scaledSettings.rightBorder || 0,
      scaledSettings.bottomBorder || 0,
      scaledSettings.leftBorder || 0
    );

    // 旋转模式下按中心点绘制，使用外接矩形保证完整显示不裁切
    if (rotationAngle !== 0) {
      const centerX = scaledSettings.leftBorder + rotatedWidth / 2;
      const centerY = scaledSettings.topBorder + rotatedHeight / 2;

      if (settings.showPhotoShadow !== false) {
        drawRotatedShadow(ctx, centerX, centerY, width, height, rotationRadians, uiScale);
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRadians);
      ctx.drawImage(image, -width / 2, -height / 2, width, height);
      ctx.restore();
    } else if (scaledSettings.borderRadius > 0 &&
        scaledSettings.topBorder > 0 && 
        scaledSettings.rightBorder > 0 && 
        scaledSettings.bottomBorder > 0 && 
        scaledSettings.leftBorder > 0) {
      // Draw image with border radius
      ctx.save();
      ctx.beginPath();
      if (settings.showPhotoShadow !== false) {
        drawRoundedRectShadow(ctx, scaledSettings.leftBorder, scaledSettings.topBorder, width, height, radius, uiScale);
      }
      ctx.moveTo(scaledSettings.leftBorder + radius, scaledSettings.topBorder);
      ctx.lineTo(scaledSettings.leftBorder + width - radius, scaledSettings.topBorder);
      ctx.arcTo(scaledSettings.leftBorder + width, scaledSettings.topBorder, scaledSettings.leftBorder + width, scaledSettings.topBorder + radius, radius);
      ctx.lineTo(scaledSettings.leftBorder + width, scaledSettings.topBorder + height - radius);
      ctx.arcTo(scaledSettings.leftBorder + width, scaledSettings.topBorder + height, scaledSettings.leftBorder + width - radius, scaledSettings.topBorder + height, radius);
      ctx.lineTo(scaledSettings.leftBorder + radius, scaledSettings.topBorder + height);
      ctx.arcTo(scaledSettings.leftBorder, scaledSettings.topBorder + height, scaledSettings.leftBorder, scaledSettings.topBorder + height - radius, radius);
      ctx.lineTo(scaledSettings.leftBorder, scaledSettings.topBorder + radius);
      ctx.arcTo(scaledSettings.leftBorder, scaledSettings.topBorder, scaledSettings.leftBorder + radius, scaledSettings.topBorder, radius);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(image, scaledSettings.leftBorder, scaledSettings.topBorder, width, height);
      ctx.restore();
    } else {
      // 如果边框宽度为0或圆角为0，直接绘制图像
      if (settings.showPhotoShadow !== false) {
        drawRectShadow(ctx, scaledSettings.leftBorder, scaledSettings.topBorder, width, height, uiScale);
      }
      ctx.drawImage(image, scaledSettings.leftBorder, scaledSettings.topBorder, width, height);
    }

    // 确保底部边框至少有最小高度以容纳logo和文本信息
    const minBottomBorderForInfo = 30;
    const effectiveBottomBorder = Math.max(scaledSettings.bottomBorder, 0);
    
    // 只有当底部边框有高度时才绘制相机信息和logo
    if (effectiveBottomBorder > 0) {
      // 创建一个Promise来处理水印绘制
      const drawWatermarkPromise = new Promise((watermarkResolve) => {
        // 根据选择的水印风格应用不同的绘制方式
        if (settings.watermarkStyle === 'dualLine') {
          // 绘制双行对齐风格的水印
          drawDualLineWatermark(ctx, scaledSettings, exifData, totalWidth, totalHeight, effectiveBottomBorder, watermarkResolve);
        } else {
          // 绘制默认风格的水印（原有逻辑）
          drawDefaultWatermark(ctx, scaledSettings, exifData, totalWidth, totalHeight, effectiveBottomBorder, watermarkResolve);
        }
      });
      
      // 等待水印绘制完成后再导出图像
      drawWatermarkPromise.then(() => {
        if (settings.showColorStrip) {
          drawColorStrip(ctx, image, width, height, scaledSettings, rotatedWidth, effectiveBottomBorder);
        }

        // 根据用户选择的格式和质量导出图像
        if (settings.imageFormat === 'jpeg') {
          resolve(canvas.toDataURL('image/jpeg', settings.imageQuality));
        } else {
          // PNG是无损的，不需要指定质量参数
          resolve(canvas.toDataURL('image/png'));
        }
      });
    } else {
      if (settings.showColorStrip) {
        drawColorStrip(ctx, image, width, height, scaledSettings, rotatedWidth, effectiveBottomBorder);
      }

      // 如果没有底部边框，则直接导出图像
      if (settings.imageFormat === 'jpeg') {
        resolve(canvas.toDataURL('image/jpeg', settings.imageQuality));
      } else {
        resolve(canvas.toDataURL('image/png'));
      }
    }
  });
};

const applySoftShadow = (ctx, scale = 1) => {
  ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
  ctx.shadowBlur = 12 * scale;
  ctx.shadowOffsetX = 6 * scale;
  ctx.shadowOffsetY = 6 * scale;
};

const drawRectShadow = (ctx, x, y, width, height, scale = 1) => {
  ctx.save();
  applySoftShadow(ctx, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
  ctx.fillRect(x, y, width, height);
  ctx.restore();
};

const drawRoundedRectShadow = (ctx, x, y, width, height, radius, scale = 1) => {
  ctx.save();
  applySoftShadow(ctx, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.fill();
  ctx.restore();
};

const drawRotatedShadow = (ctx, centerX, centerY, width, height, radians, scale = 1) => {
  ctx.save();
  applySoftShadow(ctx, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
  ctx.translate(centerX, centerY);
  ctx.rotate(radians);
  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.restore();
};

const roundedRectPath = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
};

const drawColorStrip = (ctx, image, displayWidth, displayHeight, settings, rotatedWidth, effectiveBottomBorder) => {
  const sampleSize = 100;
  const samples = 5;
  const stripScale = Math.max(1, rotatedWidth / 1200);
  const stripLengthRatio = clamp(settings.colorStripLength || 0.35, 0.2, 1);
  const stripWidth = Math.max(100, rotatedWidth * stripLengthRatio);
  const swatchWidth = stripWidth / samples;
  const swatchHeight = 22 * stripScale;
  const stripHeight = swatchHeight;

  const colors = getMiddleBandAverageColors(image, displayWidth, displayHeight, sampleSize, samples);
  if (!colors.length) return;

  // 让色彩条和照片边缘对齐，而不是和画布边缘对齐
  const photoLeft = settings.leftBorder;
  const photoRight = settings.leftBorder + rotatedWidth;
  const stripX = settings.colorStripPosition === 'left'
    ? photoLeft
    : photoRight - stripWidth;

  // 顶部距离可调节，默认沿用底部边框高度语义
  const topOffset = settings.colorStripTopOffset ?? effectiveBottomBorder;
  const stripY = Math.max(0, topOffset);

  ctx.save();
  colors.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(stripX + index * swatchWidth, stripY, swatchWidth, swatchHeight);
  });
  ctx.restore();
};

const getMiddleBandAverageColors = (image, width, height, sampleSize, sampleCount) => {
  const offscreen = document.createElement('canvas');
  offscreen.width = Math.max(1, Math.round(width));
  offscreen.height = Math.max(1, Math.round(height));
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return [];

  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';
  offCtx.drawImage(image, 0, 0, offscreen.width, offscreen.height);

  const colors = [];
  const centerY = offscreen.height / 2;

  for (let i = 0; i < sampleCount; i++) {
    const centerX = ((i + 0.5) * offscreen.width) / sampleCount;
    const x = clamp(Math.round(centerX - sampleSize / 2), 0, Math.max(0, offscreen.width - sampleSize));
    const y = clamp(Math.round(centerY - sampleSize / 2), 0, Math.max(0, offscreen.height - sampleSize));
    const w = Math.min(sampleSize, offscreen.width);
    const h = Math.min(sampleSize, offscreen.height);
    const imageData = offCtx.getImageData(x, y, w, h).data;

    let r = 0;
    let g = 0;
    let b = 0;
    const pixels = imageData.length / 4;
    for (let p = 0; p < imageData.length; p += 4) {
      r += imageData[p];
      g += imageData[p + 1];
      b += imageData[p + 2];
    }

    colors.push(`rgb(${Math.round(r / pixels)}, ${Math.round(g / pixels)}, ${Math.round(b / pixels)})`);
  }

  return colors;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// 绘制默认风格的水印（单行居中）
const drawDefaultWatermark = (ctx, settings, exifData, totalWidth, totalHeight, effectiveBottomBorder, resolveCallback) => {
  ctx.fillStyle = '#333';
  const spacingScale = Math.max(1, totalWidth / 1200);
  const textPadding = 10 * spacingScale;
  
  // 根据图片尺寸调整文字大小，确保在大图片上文字也足够大
  // 计算基础字体大小，然后应用用户设置的文字大小缩放比例
  const baseFontSize = Math.max(14, totalWidth / 50);
  const adjustedFontSize = baseFontSize * (settings.textSize || 1.0); // 应用用户设置的文字大小比例
  ctx.font = `${adjustedFontSize}px Arial`;
  
  // 计算文本y坐标，使其垂直居中
  // 底部边框的中心点位置
  const centerY = totalHeight - effectiveBottomBorder/2;
  // 文本基线需要调整，因为文本绘制是基于基线的，而非正中央
  // 近似调整为字体大小的1/3，让文本在视觉上居中
  const textBaselineAdjustment = adjustedFontSize/3;
  const textY = centerY + textBaselineAdjustment;
  
  // Camera model (left) - 使用用户输入的相机型号
  const model = settings.cameraModel || exifData?.Model || 'Unknown Camera';
  ctx.textAlign = 'left';
  if (settings.leftBorder > 0) {
    ctx.fillText(model, settings.leftBorder + textPadding, textY);
  } else {
    ctx.fillText(model, textPadding, textY);
  }
  
  // Draw EXIF data (right) - 使用用户输入的相机参数
  const focalLength = settings.focalLength ? `${settings.focalLength}mm` : '';
  const fNumber = settings.aperture ? `f/${settings.aperture}` : '';
  const shutterSpeed = settings.shutterSpeed ? `1/${settings.shutterSpeed}` : '';
  const iso = settings.iso ? `ISO ${settings.iso}` : '';
  
  const exifText = [focalLength, fNumber, shutterSpeed, iso].filter(Boolean).join(' | ');
  if (exifText) {
    ctx.textAlign = 'right';
    ctx.fillText(exifText, totalWidth - settings.rightBorder - textPadding, textY);
  }

  // 只在底部边框足够高时绘制logo
  if (effectiveBottomBorder >= 20) {
    // 根据图片尺寸和底部边框高度调整logo尺寸
    // 更大的logo高度，确保在大图片上logo也清晰可见
    const baseLogoHeight = Math.max(30, totalWidth / 40);
    
    // 应用用户设置的logo缩放比例
    let brandSpecificScale = 1.0;

    // 为NIKON logo添加特殊处理，默认放大到500%
    if (settings.selectedBrand === 'nikon') {
      brandSpecificScale = 5.0; // 为NIKON logo默认放大到500%
    }
    
    // 为适马logo添加特殊处理，基础大小提高200%（放大到300%）
    if (settings.selectedBrand === 'sigma') {
      brandSpecificScale = 3.0; // 为适马logo默认放大到300%
    }
    
    const scaledLogoHeight = baseLogoHeight * settings.logoSize * brandSpecificScale;
    
    // 确保logo不会超出底部边框
    const logoHeight = Math.min(scaledLogoHeight, effectiveBottomBorder - textPadding);
    
    // 计算logo的y坐标，使其垂直居中
    const logoY = totalHeight - effectiveBottomBorder + (effectiveBottomBorder - logoHeight) / 2;
    
    const img = new Image();
    
    // 设置logo图像源
    if (settings.selectedBrand === 'canon') {
      // 使用本地PNG文件作为佳能logo
      img.src = logos.CANON_LOGO;
    } else if (settings.selectedBrand === 'fuji') {
      img.src = logos.FUJI_LOGO;
    } else if (settings.selectedBrand === 'nikon') {
      img.src = logos.NIKON_LOGO;
    } else if (settings.selectedBrand === 'gmaster') {
      img.src = logos.GM_LOGO;
    } else if (settings.selectedBrand === 'sigma') {
      img.src = logos.SIGMA_LOGO;
    } else {
      // 默认索尼logo
      img.src = logos.SONY_LOGO;
    }
    
    img.onload = () => {
      // 保持logo的原始宽高比例
      const aspectRatio = img.width / img.height;
      const logoWidth = logoHeight * aspectRatio;
      const logoX = (totalWidth - logoWidth) / 2;
      
      ctx.drawImage(img, logoX, logoY, logoWidth, logoHeight);
      
      // 完成绘制后解析Promise
      if (resolveCallback) resolveCallback();
    };
    
    // 添加错误处理，防止logo加载失败影响整体处理流程
    img.onerror = () => {
      console.error(`无法加载${settings.selectedBrand}品牌logo`);
      // 即使加载失败也要解析Promise
      if (resolveCallback) resolveCallback();
    };
  } else {
    // 如果不绘制logo，直接解析Promise
    if (resolveCallback) resolveCallback();
  }
};

// 绘制双行对齐风格的水印
const drawDualLineWatermark = (ctx, settings, exifData, totalWidth, totalHeight, effectiveBottomBorder, resolveCallback) => {
  ctx.fillStyle = '#333';
  const spacingScale = Math.max(1, totalWidth / 1200);
  const textPadding = 10 * spacingScale;
  const logoTextGap = 55 * spacingScale;
  const logoDividerGap = 25 * spacingScale;
  const dividerTextGap = 20 * spacingScale;
  
  // 计算基础字体大小，然后应用用户设置的文字大小缩放比例
  const baseFontSize = Math.max(14, totalWidth / 60);
  const adjustedFontSize = baseFontSize * (settings.textSize || 1.0);
  
  // 为标题设置稍大的字体
  const titleFontSize = adjustedFontSize;
  const subtitleFontSize = adjustedFontSize * 0.85;
  
  // 行高计算
  const lineHeight = adjustedFontSize * 1.5;
  
  // 计算文本起始Y坐标（双行文本的顶部位置）
  const textStartY = totalHeight - effectiveBottomBorder + (effectiveBottomBorder - lineHeight * 2) / 2 + adjustedFontSize;
  
  // 设置标题字体
  ctx.font = `bold ${titleFontSize}px Arial`;
  
  // 左侧文本 - 第一行（镜头名称）
  const lensName = settings.lensModel || (settings.focalLength ? `${settings.focalLength}mm` : 'Unknown Lens');
  ctx.textAlign = 'left';
  const leftMargin = settings.leftBorder > 0 ? settings.leftBorder + textPadding : textPadding;
  ctx.fillText(lensName, leftMargin, textStartY);
  
  // 左侧文本 - 第二行（相机名称）
  const cameraModel = settings.cameraModel || exifData?.Model || 'Unknown Camera';
  ctx.font = `${subtitleFontSize}px Arial`;
  ctx.fillText(cameraModel, leftMargin, textStartY + lineHeight);
  
  // 右侧文本 - 第一行（光圈快门ISO）
  const focalLength = settings.focalLength ? `${settings.focalLength}mm` : '';
  const fNumber = settings.aperture ? `f/${settings.aperture}` : '';
  const shutterSpeed = settings.shutterSpeed ? `1/${settings.shutterSpeed}` : '';
  const iso = settings.iso ? `ISO ${settings.iso}` : '';
  
  const settingsText = [focalLength, fNumber, shutterSpeed, iso].filter(Boolean).join(' | ');
  
  // 绘制Logo（位于右侧文本的左侧）
  // 计算Logo尺寸和位置
  const logoBaseHeight = Math.max(24, totalWidth / 50);
  
  // 应用品牌特定的缩放比例
  let brandSpecificScale = 1.0;
  
  // 为适马logo添加特殊处理，基础大小提高200%（放大到300%）
  if (settings.selectedBrand === 'sigma') {
    brandSpecificScale = 3.0; // 为适马logo默认放大到300%
  }
  
  const logoHeight = logoBaseHeight * settings.logoSize * brandSpecificScale;
  
  // 计算Logo垂直居中位置
  const logoY = totalHeight - effectiveBottomBorder + (effectiveBottomBorder - logoHeight) / 2;
  
  const img = new Image();
  
  // 设置logo图像源
  if (settings.selectedBrand === 'canon') {
    img.src = logos.CANON_LOGO;
  } else if (settings.selectedBrand === 'fuji') {
    img.src = logos.FUJI_LOGO;
  } else if (settings.selectedBrand === 'nikon') {
    img.src = logos.NIKON_LOGO;
  } else if (settings.selectedBrand === 'gmaster') {
    img.src = logos.GM_LOGO;
  } else if (settings.selectedBrand === 'sigma') {
    img.src = logos.SIGMA_LOGO;
  } else {
    // 默认索尼logo
    img.src = logos.SONY_LOGO;
  }
  
  img.onload = () => {
    // 保持logo的原始宽高比
    const aspectRatio = img.width / img.height;
    const logoWidth = logoHeight * aspectRatio;
    
    // 计算logo的水平位置（右侧文本的左侧，间隔20px）
    // 测量右侧文本最长部分的宽度
    ctx.font = `bold ${titleFontSize}px Arial`;
    const settingsTextWidth = ctx.measureText(settingsText).width;
    ctx.font = `${subtitleFontSize}px Arial`;
    
    // 右侧文本 - 第二行（时间）
    // 使用用户输入的日期或默认为当前日期
    let dateText;
    if (settings.customDate) {
      // 如果用户提供了自定义日期
      dateText = settings.customDate;
    } else {
      // 默认使用当前日期
      const now = new Date();
      dateText = now.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    }
    
    const dateTextWidth = ctx.measureText(dateText).width;
    const rightTextMaxWidth = Math.max(settingsTextWidth, dateTextWidth);
    
    const rightMargin = totalWidth - (settings.rightBorder > 0 ? settings.rightBorder + textPadding : textPadding);
    const logoX = rightMargin - rightTextMaxWidth - logoWidth - logoTextGap; // 增加了间距以腾出更多竖线空间
    
    // 计算分割线的位置（在logo右侧，右侧文本左侧）
    const dividerX = logoX + logoWidth + logoDividerGap; // 增加了logo右侧到竖线的间距
    const dividerStartY = textStartY - adjustedFontSize; // 分割线起始位置
    const dividerEndY = textStartY + lineHeight + subtitleFontSize/2; // 分割线结束位置
    
    // 绘制细灰色分割竖线
    ctx.beginPath();
    ctx.strokeStyle = '#aaaaaa'; // 灰色
    ctx.lineWidth = 1; // 细线
    ctx.moveTo(dividerX, dividerStartY);
    ctx.lineTo(dividerX, dividerEndY);
    ctx.stroke();
    
    // 绘制logo
    ctx.drawImage(img, logoX, logoY, logoWidth, logoHeight);
    
    // 重新绘制右侧文本，左对齐到竖线
    const rightTextX = dividerX + dividerTextGap; // 增加了竖线右侧到文本的间距
    
    // 第一行文本
    ctx.font = `bold ${titleFontSize}px Arial`;
    ctx.textAlign = 'left'; // 改为左对齐
    ctx.fillText(settingsText, rightTextX, textStartY);
    
    // 第二行文本
    ctx.font = `${subtitleFontSize}px Arial`;
    ctx.fillText(dateText, rightTextX, textStartY + lineHeight);
    
    // 完成绘制后解析Promise
    if (resolveCallback) resolveCallback();
  };
  
  img.onerror = () => {
    console.error(`无法加载${settings.selectedBrand}品牌logo`);
    // 即使加载失败也要解析Promise
    if (resolveCallback) resolveCallback();
  };
};

export default processImage;