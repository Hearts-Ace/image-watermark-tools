import React from 'react';

function WatermarkStyles({ selectedStyle, setSelectedStyle }) {
  // 水印风格选项
  const styles = [
    { id: 'default', name: '默认风格' },
    { id: 'dualLine', name: '双行对齐风格' },
  ];

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-800 mb-3">水印风格选择</h3>
      <div className="flex flex-wrap gap-3">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => setSelectedStyle(style.id)}
            className={`px-4 py-2 rounded ${
              selectedStyle === style.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default WatermarkStyles; 