import React, { useState, useRef, useEffect } from 'react';

const BokehTest = ({ onExit }) => {
  const canvasRef = useRef(null);
  const [settings, setSettings] = useState({
    circleSize: 20,
    colorMode: 'random', // 'random' or 'solid'
    solidColor: '#ffffff',
    layoutMode: 'regular', // 'regular' or 'random'
    density: 50, // 圆点密度 (1-100)
    animationSpeed: 0, // 动画速度 (0为静态)
  });
  const [showControls, setShowControls] = useState(true);

  const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fab1a0', '#fd79a8', '#a29bfe'];

  const generatePoints = (width, height) => {
    const points = [];
    const spacing = Math.max(20, settings.circleSize * 2);
    
    if (settings.layoutMode === 'regular') {
      // 规律排列 - 自适应充满整个屏幕
      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);
      
      // 计算实际应该显示的列数和行数（基于密度）
      // 使用更平滑的密度控制算法
      const densityFactor = settings.density / 100;
      const targetCols = Math.max(2, Math.floor(cols * Math.sqrt(densityFactor)));
      const targetRows = Math.max(2, Math.floor(rows * Math.sqrt(densityFactor)));
      
      // 重新计算spacing以充满屏幕
      const actualSpacingX = width / targetCols;
      const actualSpacingY = height / targetRows;
      
      for (let row = 0; row < targetRows; row++) {
        for (let col = 0; col < targetCols; col++) {
          const x = (col + 0.5) * actualSpacingX;
          const y = (row + 0.5) * actualSpacingY;
          
          points.push({
            x,
            y,
            color: settings.colorMode === 'random' 
              ? colors[Math.floor(Math.random() * colors.length)]
              : settings.solidColor,
            size: settings.circleSize + (Math.random() - 0.5) * settings.circleSize * 0.3
          });
        }
      }
    } else {
      // 随机排列
      const totalPoints = Math.floor((width * height / (spacing * spacing)) * settings.density / 100);
      
      for (let i = 0; i < totalPoints; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          color: settings.colorMode === 'random'
            ? colors[Math.floor(Math.random() * colors.length)]
            : settings.solidColor,
          size: settings.circleSize + (Math.random() - 0.5) * settings.circleSize * 0.5
        });
      }
    }
    
    return points;
  };

  const drawPoints = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // 清空画布并设置黑色背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // 生成并绘制圆点
    const points = generatePoints(width, height);
    
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.fill();
      
      // 添加一些辉光效果
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, point.size
      );
      gradient.addColorStop(0, point.color);
      gradient.addColorStop(0.7, point.color + '80');
      gradient.addColorStop(1, point.color + '00');
      
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawPoints();
    };
    
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === 'h') {
        setShowControls(prev => !prev);
      } else if (event.key === 'Escape' && onExit) {
        onExit();
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [settings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const downloadTestPattern = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `bokeh-test-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="bokeh-test-container">
      <canvas
        ref={canvasRef}
        className="bokeh-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1,
          background: '#000000'
        }}
      />
      
      <div className="controls-panel" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 10,
        minWidth: '250px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        display: showControls ? 'block' : 'none',
        transition: 'opacity 0.3s ease-in-out'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>
          镜头焦外测试控制面板
        </h3>
        
        <div className="control-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            圆点大小: {settings.circleSize}px
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={settings.circleSize}
            onChange={(e) => handleSettingChange('circleSize', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div className="control-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            圆点密度: {settings.density}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.density}
            onChange={(e) => handleSettingChange('density', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div className="control-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            颜色模式:
          </label>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <input
                type="radio"
                name="colorMode"
                value="random"
                checked={settings.colorMode === 'random'}
                onChange={(e) => handleSettingChange('colorMode', e.target.value)}
                style={{ marginRight: '8px' }}
              />
              随机混色 (红黄绿蓝粉紫)
            </label>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <input
                type="radio"
                name="colorMode"
                value="solid"
                checked={settings.colorMode === 'solid'}
                onChange={(e) => handleSettingChange('colorMode', e.target.value)}
                style={{ marginRight: '8px' }}
              />
              纯色
            </label>
          </div>
        </div>

        {settings.colorMode === 'solid' && (
          <div className="control-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              纯色选择:
            </label>
            <input
              type="color"
              value={settings.solidColor}
              onChange={(e) => handleSettingChange('solidColor', e.target.value)}
              style={{ width: '100%', height: '40px', border: 'none', borderRadius: '5px' }}
            />
          </div>
        )}

        <div className="control-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            分布模式:
          </label>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <input
                type="radio"
                name="layoutMode"
                value="regular"
                checked={settings.layoutMode === 'regular'}
                onChange={(e) => handleSettingChange('layoutMode', e.target.value)}
                style={{ marginRight: '8px' }}
              />
              规律排列
            </label>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <input
                type="radio"
                name="layoutMode"
                value="random"
                checked={settings.layoutMode === 'random'}
                onChange={(e) => handleSettingChange('layoutMode', e.target.value)}
                style={{ marginRight: '8px' }}
              />
              随机不规律排列
            </label>
          </div>
        </div>

        <button
          onClick={downloadTestPattern}
          style={{
            width: '100%',
            padding: '10px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          下载测试图案
        </button>
        
        <div style={{ 
          marginTop: '15px', 
          fontSize: '12px', 
          color: '#666', 
          lineHeight: '1.4' 
        }}>
          提示：调整设置后图案会自动更新。建议使用三脚架固定相机，对比不同镜头的焦外效果。
          <br/>
          <strong>按 H 键隐藏/显示控制面板 | 按 ESC 键返回首页</strong>
        </div>
      </div>

      {!showControls && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 10
        }}>
          按 H 键显示控制面板
        </div>
      )}
    </div>
      );
  };
  
  export default BokehTest; 