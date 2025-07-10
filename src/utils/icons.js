// 图标缓存
const iconCache = new Map();

// 动态导入图标
export async function loadIcon(iconName) {
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName);
  }

  try {
    const icons = await import('@element-plus/icons-vue');
    const icon = icons[iconName];
    
    if (icon) {
      iconCache.set(iconName, icon);
      return icon;
    } else {
      console.warn(`Icon ${iconName} not found`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to load icon ${iconName}:`, error);
    return null;
  }
}

// 批量加载图标
export async function loadIcons(iconNames) {
  const icons = {};
  
  for (const iconName of iconNames) {
    const icon = await loadIcon(iconName);
    if (icon) {
      icons[iconName] = icon;
    }
  }
  
  return icons;
}

// 预加载常用图标
export async function preloadCommonIcons() {
  const commonIcons = [
    'CopyDocument',
    'ArrowRight',
    'ArrowLeft',
    'Key',
    'Switch',
    'Sunny',
    'Moon',
    'DocumentCopy',
    'Sort',
    'Filter',
    'Refresh',
    'VideoPause',
    'VideoPlay',
    'Clock',
    'Timer',
    'Calendar',
    'Document'
  ];
  
  return await loadIcons(commonIcons);
} 