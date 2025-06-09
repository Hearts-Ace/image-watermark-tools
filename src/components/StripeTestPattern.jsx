import React, { useState, useEffect } from 'react';

function StripeTestPattern({ onExit }) {
  const [stripeWidth, setStripeWidth] = useState(20); // 默认条纹宽度为20px
  const [orientation, setOrientation] = useState('horizontal'); // 'horizontal' 或 'vertical'
  const [showControls, setShowControls] = useState(true); // 控制面板显示状态

  // 计算需要多少条纹来填满屏幕
  const [stripeCount, setStripeCount] = useState(0);

  useEffect(() => {
    const calculateStripeCount = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // 根据方向计算需要的条纹数量
      const dimension = orientation === 'horizontal' ? windowHeight : windowWidth;
      const count = Math.ceil(dimension / stripeWidth);
      
      setStripeCount(count);
    };

    calculateStripeCount();
    window.addEventListener('resize', calculateStripeCount);
    
    return () => window.removeEventListener('resize', calculateStripeCount);
  }, [stripeWidth, orientation]);

  // 生成条纹模式
  const generateStripes = () => {
    const stripes = [];
    
    for (let i = 0; i < stripeCount; i++) {
      const isBlack = i % 2 === 0;
      
      const stripeStyle = {
        width: orientation === 'horizontal' ? '100vw' : `${stripeWidth}px`,
        height: orientation === 'horizontal' ? `${stripeWidth}px` : '100vh',
        position: 'absolute',
        [orientation === 'horizontal' ? 'top' : 'left']: `${i * stripeWidth}px`,
        [orientation === 'horizontal' ? 'left' : 'top']: '0',
      };
      
      stripes.push(
        <div
          key={i}
          className={`${isBlack ? 'bg-black' : 'bg-white'}`}
          style={stripeStyle}
        />
      );
    }
    return stripes;
  };

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'h' || e.key === 'H') {
        setShowControls(!showControls);
      }
      if (e.key === 'Escape') {
        if (onExit) {
          onExit();
        } else {
          setShowControls(true);
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showControls, orientation, onExit]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* 条纹容器 */}
      <div className="absolute inset-0">
        {generateStripes()}
      </div>

      {/* 控制面板 */}
      {showControls && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg z-10 max-w-sm">
          <h3 className="text-lg font-bold mb-4">镜头歪光轴检测条纹</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                条纹宽度: {stripeWidth}px
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={stripeWidth}
                onChange={(e) => setStripeWidth(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5px</span>
                <span>100px</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">条纹方向</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOrientation('horizontal')}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    orientation === 'horizontal'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  水平条纹
                </button>
                <button
                  onClick={() => setOrientation('vertical')}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    orientation === 'vertical'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  垂直条纹
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-300 space-y-1">
              <p>• 观察条纹是否平行且等宽</p>
              <p>• 检查条纹边缘是否清晰锐利</p>
              <p>• 查看不同区域的条纹对比度</p>
              <p>• 检测是否存在歪光轴现象</p>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>按 H 键隐藏/显示控制面板</p>
              <p>按 R 键切换条纹方向</p>
              <p>按 ESC 键返回首页</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStripeWidth(10)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                细条纹
              </button>
              <button
                onClick={() => setStripeWidth(20)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                中条纹
              </button>
              <button
                onClick={() => setStripeWidth(40)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                粗条纹
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 隐藏控制面板时的提示 */}
      {!showControls && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded text-sm z-10">
          按 H 键显示控制面板
        </div>
      )}

      {/* 条纹信息显示 */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded text-sm z-10">
        {orientation === 'horizontal' ? '水平' : '垂直'}条纹 | 宽度: {stripeWidth}px | 条数: {stripeCount}
      </div>
    </div>
  );
}

export default StripeTestPattern; 