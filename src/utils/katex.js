// KaTeX 配置缓存
let katexConfigured = false;

// 配置 KaTeX
export async function configureKatex() {
  if (katexConfigured) {
    return;
  }

  try {
    const { config } = await import('md-editor-v3');
    const katex = await import('katex');
    const katexCSS = await import('katex/dist/katex.min.css');

    config({
      editorExtensions: {
        katex: {
          instance: katex.default
        }
      }
    });

    katexConfigured = true;
  } catch (error) {
    console.error('Failed to configure KaTeX:', error);
  }
}

// 检查是否已配置
export function isKatexConfigured() {
  return katexConfigured;
}