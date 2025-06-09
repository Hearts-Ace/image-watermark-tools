// src/utils/ImageProcessor.js
import * as logos from './logos.js';

const processImage = (canvas, image, settings, exifData) => {
  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d');
    
    // 获取设备像素比，以支持高分辨率显示器
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // 根据选择的输出分辨率设置maxWidth
    let maxWidth;
    switch (settings.outputResolution) {
      case 'original':
        // 限制原始尺寸的最大宽度，避免图片过大
        maxWidth = Math.min(image.width, 1800);
        break;
      case 'high':
        maxWidth = 1800;
        break;
      case 'medium':
        maxWidth = 1200;
        break;
      case 'low':
        maxWidth = 800;
        break;
      default:
        maxWidth = Math.min(image.width, 1800);
    }
    
    // Calculate dimensions - 使用选定的分辨率
    const aspectRatio = image.width / image.height;
    const width = Math.min(image.width, maxWidth);
    const height = width / aspectRatio;

    // Set canvas size including borders
    const totalWidth = width + settings.leftBorder + settings.rightBorder;
    const totalHeight = height + settings.topBorder + settings.bottomBorder;
    
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

    // 只有在边框半径大于0且所有边框都大于0时才应用圆角
    if (settings.borderRadius > 0 && 
        settings.topBorder > 0 && 
        settings.rightBorder > 0 && 
        settings.bottomBorder > 0 && 
        settings.leftBorder > 0) {
      // Draw image with border radius
      ctx.save();
      ctx.beginPath();
      const radius = Math.min(
        settings.borderRadius,
        settings.topBorder,
        settings.rightBorder,
        settings.bottomBorder,
        settings.leftBorder
      );
      ctx.moveTo(settings.leftBorder + radius, settings.topBorder);
      ctx.lineTo(settings.leftBorder + width - radius, settings.topBorder);
      ctx.arcTo(settings.leftBorder + width, settings.topBorder, settings.leftBorder + width, settings.topBorder + radius, radius);
      ctx.lineTo(settings.leftBorder + width, settings.topBorder + height - radius);
      ctx.arcTo(settings.leftBorder + width, settings.topBorder + height, settings.leftBorder + width - radius, settings.topBorder + height, radius);
      ctx.lineTo(settings.leftBorder + radius, settings.topBorder + height);
      ctx.arcTo(settings.leftBorder, settings.topBorder + height, settings.leftBorder, settings.topBorder + height - radius, radius);
      ctx.lineTo(settings.leftBorder, settings.topBorder + radius);
      ctx.arcTo(settings.leftBorder, settings.topBorder, settings.leftBorder + radius, settings.topBorder, radius);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(image, settings.leftBorder, settings.topBorder, width, height);
      ctx.restore();
    } else {
      // 如果边框宽度为0或圆角为0，直接绘制图像
      ctx.drawImage(image, settings.leftBorder, settings.topBorder, width, height);
    }

    // 确保底部边框至少有最小高度以容纳logo和文本信息
    const minBottomBorderForInfo = 30;
    const effectiveBottomBorder = Math.max(settings.bottomBorder, 0);
    
    // 只有当底部边框有高度时才绘制相机信息和logo
    if (effectiveBottomBorder > 0) {
      // 创建一个Promise来处理水印绘制
      const drawWatermarkPromise = new Promise((watermarkResolve) => {
        // 根据选择的水印风格应用不同的绘制方式
        if (settings.watermarkStyle === 'dualLine') {
          // 绘制双行对齐风格的水印
          drawDualLineWatermark(ctx, settings, exifData, totalWidth, totalHeight, effectiveBottomBorder, watermarkResolve);
        } else {
          // 绘制默认风格的水印（原有逻辑）
          drawDefaultWatermark(ctx, settings, exifData, totalWidth, totalHeight, effectiveBottomBorder, watermarkResolve);
        }
      });
      
      // 等待水印绘制完成后再导出图像
      drawWatermarkPromise.then(() => {
        // 根据用户选择的格式和质量导出图像
        if (settings.imageFormat === 'jpeg') {
          resolve(canvas.toDataURL('image/jpeg', settings.imageQuality));
        } else {
          // PNG是无损的，不需要指定质量参数
          resolve(canvas.toDataURL('image/png'));
        }
      });
    } else {
      // 如果没有底部边框，则直接导出图像
      if (settings.imageFormat === 'jpeg') {
        resolve(canvas.toDataURL('image/jpeg', settings.imageQuality));
      } else {
        resolve(canvas.toDataURL('image/png'));
      }
    }
  });
};

// 绘制默认风格的水印（单行居中）
const drawDefaultWatermark = (ctx, settings, exifData, totalWidth, totalHeight, effectiveBottomBorder, resolveCallback) => {
  ctx.fillStyle = '#333';
  
  // 根据图片尺寸调整文字大小，确保在大图片上文字也足够大
  // 计算基础字体大小，然后应用用户设置的文字大小缩放比例
  const baseFontSize = Math.max(14, Math.min(22, totalWidth / 50));
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
    ctx.fillText(model, settings.leftBorder + 10, textY);
  } else {
    ctx.fillText(model, 10, textY);
  }
  
  // Draw EXIF data (right) - 使用用户输入的相机参数
  const focalLength = settings.focalLength ? `${settings.focalLength}mm` : '';
  const fNumber = settings.aperture ? `f/${settings.aperture}` : '';
  const shutterSpeed = settings.shutterSpeed ? `1/${settings.shutterSpeed}` : '';
  const iso = settings.iso ? `ISO ${settings.iso}` : '';
  
  const exifText = [focalLength, fNumber, shutterSpeed, iso].filter(Boolean).join(' | ');
  if (exifText) {
    ctx.textAlign = 'right';
    ctx.fillText(exifText, totalWidth - settings.rightBorder - 10, textY);
  }

  // 只在底部边框足够高时绘制logo
  if (effectiveBottomBorder >= 20) {
    // 根据图片尺寸和底部边框高度调整logo尺寸
    // 更大的logo高度，确保在大图片上logo也清晰可见
    const baseLogoHeight = Math.max(30, Math.min(40, totalWidth / 40));
    
    // 应用用户设置的logo缩放比例
    let brandSpecificScale = 1.0;

    // 为NIKON logo添加特殊处理，默认放大到500%
    if (settings.selectedBrand === 'nikon') {
      brandSpecificScale = 5.0; // 为NIKON logo默认放大到200%
    }
    
    const scaledLogoHeight = baseLogoHeight * settings.logoSize * brandSpecificScale;
    
    // 确保logo不会超出底部边框
    const logoHeight = Math.min(scaledLogoHeight, effectiveBottomBorder - 10);
    
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
  
  // 计算基础字体大小，然后应用用户设置的文字大小缩放比例
  const baseFontSize = Math.max(14, Math.min(20, totalWidth / 60));
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
  const leftMargin = settings.leftBorder > 0 ? settings.leftBorder + 10 : 10;
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
  const logoBaseHeight = Math.max(24, Math.min(32, totalWidth / 50));
  const logoHeight = logoBaseHeight * settings.logoSize;
  
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
    
    const rightMargin = totalWidth - (settings.rightBorder > 0 ? settings.rightBorder + 10 : 10);
    const logoX = rightMargin - rightTextMaxWidth - logoWidth - 55; // 增加了间距以腾出更多竖线空间
    
    // 计算分割线的位置（在logo右侧，右侧文本左侧）
    const dividerX = logoX + logoWidth + 25; // 增加了logo右侧到竖线的间距
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
    const rightTextX = dividerX + 20; // 增加了竖线右侧到文本的间距
    
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