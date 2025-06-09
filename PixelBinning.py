import rawpy
import numpy as np
from PIL import Image
import cv2

def apply_color_matrix(rgb_linear):
    """应用Sony相机的色彩矩阵转换"""
    # 使用更温和的色彩矩阵，避免过度校正
    color_matrix = np.array([
        [1.5, -0.3, -0.2],
        [-0.2, 1.3, -0.1],
        [-0.1, -0.2, 1.3]
    ])
    
    # 应用色彩矩阵
    rgb_shape = rgb_linear.shape
    rgb_flat = rgb_linear.reshape(-1, 3)
    rgb_corrected = np.dot(rgb_flat, color_matrix.T)
    rgb_corrected = rgb_corrected.reshape(rgb_shape)
    
    return np.clip(rgb_corrected, 0, 65535)

def calculate_auto_exposure(rgb_linear):
    """计算自动曝光补偿值"""
    # 计算图像的平均亮度
    gray = 0.299 * rgb_linear[:,:,0] + 0.587 * rgb_linear[:,:,1] + 0.114 * rgb_linear[:,:,2]
    mean_brightness = np.mean(gray) / 65535.0
    
    # 目标亮度约为18%灰度
    target_brightness = 0.18
    
    # 计算曝光补偿
    if mean_brightness > 0:
        exposure_compensation = np.log2(target_brightness / mean_brightness)
        # 限制曝光补偿范围
        exposure_compensation = np.clip(exposure_compensation, -1.5, 2.0)
    else:
        exposure_compensation = 0.5
    
    print(f"平均亮度: {mean_brightness:.3f}, 曝光补偿: {exposure_compensation:.2f} EV")
    return exposure_compensation

def apply_srgb_gamma(img_linear, exposure_compensation=None):
    """应用sRGB gamma校正，添加自适应曝光补偿"""
    if exposure_compensation is None:
        exposure_compensation = calculate_auto_exposure(img_linear)
    
    # 曝光补偿
    img_linear = img_linear * (2 ** exposure_compensation)
    img_linear = np.clip(img_linear / 65535.0, 0, 1)  # 归一化
    
    mask = img_linear <= 0.0031308
    img_gamma = np.where(
        mask,
        img_linear * 12.92,
        1.055 * np.power(img_linear, 1/2.4) - 0.055
    )
    return (img_gamma * 255).astype(np.uint8)

def save_as_16bit(img_linear, output_path):
    """正确保存16位TIFF图像"""
    img_16bit = np.clip(img_linear, 0, 65535).astype(np.uint16)
    
    # 检查数据范围，用于调试
    print(f"保存前16位图像数据范围: {img_16bit.min()} - {img_16bit.max()}")
    print(f"保存前图像形状: {img_16bit.shape}")
    print(f"各通道数据范围 - R: {img_16bit[:,:,0].min()}-{img_16bit[:,:,0].max()}, G: {img_16bit[:,:,1].min()}-{img_16bit[:,:,1].max()}, B: {img_16bit[:,:,2].min()}-{img_16bit[:,:,2].max()}")
    
    if len(img_16bit.shape) == 3:
        # 使用OpenCV保存16位TIFF，更可靠
        # OpenCV使用BGR顺序，需要转换
        img_bgr = cv2.cvtColor(img_16bit, cv2.COLOR_RGB2BGR)
        success = cv2.imwrite(output_path, img_bgr)
        print(f"OpenCV保存结果: {success}, 文件: {output_path}")
        
        # 同时用PIL保存一个副本进行对比
        pil_path = output_path.replace('.tiff', '_pil.tiff')
        img_pil = Image.fromarray(img_16bit, mode='RGB')
        img_pil.save(pil_path, format='TIFF')
        print(f"PIL保存副本: {pil_path}")
    else:
        # 单通道图像
        cv2.imwrite(output_path, img_16bit)

def read_and_merge_sony_raw(raw_file_path, output_path, target_kelvin=4500):
    try:
        with rawpy.imread(raw_file_path) as raw:
            raw_data = raw.raw_image  # 获取原始数据（uint16）
            
            print(f"原始数据范围: {raw_data.min()} - {raw_data.max()}")
            print(f"原始数据形状: {raw_data.shape}")

            # 分通道提取 RGGB 像素
            r = raw_data[::2, ::2]    # R
            g1 = raw_data[::2, 1::2]  # G1
            g2 = raw_data[1::2, ::2]  # G2
            b = raw_data[1::2, 1::2]  # B

            print(f"分离后通道数据范围 - R: {r.min()}-{r.max()}, G1: {g1.min()}-{g1.max()}, G2: {g2.min()}-{g2.max()}, B: {b.min()}-{b.max()}")

            # 获取相机白平衡
            camera_wb = raw.camera_whitebalance
            print(f"相机白平衡: {camera_wb}")
            
            # 使用简单的白平衡方法
            r_gain = camera_wb[0] / camera_wb[1]  # 相对于绿色通道
            g_gain = 1.0  # 绿色通道作为基准
            b_gain = camera_wb[2] / camera_wb[1]  # 相对于绿色通道
            
            print(f"白平衡增益 - R: {r_gain:.3f}, G: {g_gain:.3f}, B: {b_gain:.3f}")
            
            # 应用白平衡
            r_balanced = np.clip(r * r_gain, 0, 65535)
            g_balanced = np.clip((g1 + g2) / 2, 0, 65535)  # 简单平均两个绿色通道
            b_balanced = np.clip(b * b_gain, 0, 65535)
            
            print(f"白平衡后数据范围 - R: {r_balanced.min()}-{r_balanced.max()}, G: {g_balanced.min()}-{g_balanced.max()}, B: {b_balanced.min()}-{b_balanced.max()}")

            # 合并为 RGB 图像
            merged_rgb = np.stack([r_balanced, g_balanced, b_balanced], axis=-1)
            print(f"合并后RGB数据范围: {merged_rgb.min()} - {merged_rgb.max()}")
            print(f"合并后各通道范围 - R: {merged_rgb[:,:,0].min()}-{merged_rgb[:,:,0].max()}, G: {merged_rgb[:,:,1].min()}-{merged_rgb[:,:,1].max()}, B: {merged_rgb[:,:,2].min()}-{merged_rgb[:,:,2].max()}")
            
            # 先保存未经色彩矩阵处理的版本
            raw_output_path = output_path.replace('.tiff', '_raw.tiff')
            save_as_16bit(merged_rgb, raw_output_path)
            print(f"原始合并结果保存到: {raw_output_path}")
            
            # 应用色彩矩阵校正
            rgb_corrected = apply_color_matrix(merged_rgb)
            print(f"色彩校正后数据范围: {rgb_corrected.min()} - {rgb_corrected.max()}")
            print(f"色彩校正后各通道范围 - R: {rgb_corrected[:,:,0].min()}-{rgb_corrected[:,:,0].max()}, G: {rgb_corrected[:,:,1].min()}-{rgb_corrected[:,:,1].max()}, B: {rgb_corrected[:,:,2].min()}-{rgb_corrected[:,:,2].max()}")

            # 保存16位图像
            save_as_16bit(rgb_corrected, output_path)
            print(f"处理成功！结果保存到: {output_path}")
            
            # 保存8位gamma校正版本用于预览，使用自适应曝光补偿
            rgb_8bit = apply_srgb_gamma(rgb_corrected)
            preview_path = output_path.replace('.tiff', '_preview.jpg')
            Image.fromarray(rgb_8bit).save(preview_path, quality=95)
            print(f"预览图像保存到: {preview_path}")

    except Exception as e:
        print(f"错误: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    input_file = "input.ARW"
    output_file = "output_gamma_corrected.tiff"
    read_and_merge_sony_raw(input_file, output_file, target_kelvin=4500) 