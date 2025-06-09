import React, { useState, useEffect } from 'react';

function DistortionTestGrid({ onExit }) {
  const [gridSize, setGridSize] = useState(50); // 默认格子大小为50px
  const [showControls, setShowControls] = useState(true); // 控制面板显示状态

  // 计算需要多少行和列来填满屏幕
  const [gridDimensions, setGridDimensions] = useState({ rows: 0, cols: 0 });

  useEffect(() => {
    const calculateGridDimensions = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // 计算4:3比例的矩形格子数量
      const cols = Math.ceil(windowWidth / gridSize);
      const rows = Math.ceil(windowHeight / gridSize);
      
      setGridDimensions({ rows, cols });
    };

    calculateGridDimensions();
    window.addEventListener('resize', calculateGridDimensions);
    
    return () => window.removeEventListener('resize', calculateGridDimensions);
  }, [gridSize]);

  // 生成棋盘格模式
  const generateGrid = () => {
    const grid = [];
    for (let row = 0; row < gridDimensions.rows; row++) {
      for (let col = 0; col < gridDimensions.cols; col++) {
        const isBlack = (row + col) % 2 === 0;
        grid.push(
          <div
            key={`${row}-${col}`}
            className={`${isBlack ? 'bg-black' : 'bg-white'}`}
            style={{
              width: `${gridSize}px`,
              height: `${gridSize}px`,
              position: 'absolute',
              left: `${col * gridSize}px`,
              top: `${row * gridSize}px`,
            }}
          />
        );
      }
    }
    return grid;
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
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showControls, onExit]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* 网格容器 */}
      <div className="absolute inset-0">
        {generateGrid()}
      </div>

      {/* 控制面板 */}
      {showControls && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg z-10">
          <h3 className="text-lg font-bold mb-4">镜头畸变检测网格</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                格子大小: {gridSize}px
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10px</span>
                <span>200px</span>
              </div>
            </div>

            <div className="text-sm text-gray-300 space-y-1">
              <p>• 观察网格线是否保持直线</p>
              <p>• 检查边缘是否有弯曲变形</p>
              <p>• 格子应保持正方形比例</p>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>按 H 键隐藏/显示控制面板</p>
              <p>按 ESC 键返回首页</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setGridSize(25)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                小格子
              </button>
              <button
                onClick={() => setGridSize(50)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                中格子
              </button>
              <button
                onClick={() => setGridSize(100)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                大格子
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

      {/* 网格信息显示 */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded text-sm z-10">
        网格: {gridDimensions.cols} × {gridDimensions.rows} | 格子大小: {gridSize}px
      </div>
    </div>
  );
}

export default DistortionTestGrid; 