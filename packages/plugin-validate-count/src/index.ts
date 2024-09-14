import type { BytemdPlugin, BytemdEditorContext } from 'bytemd';
import type { PluginValidateOptions } from './types';

export default function validateCountPlugin(options: PluginValidateOptions = {}): BytemdPlugin {
  let editorCtx: BytemdEditorContext;
  let markdownBodyPreview: HTMLElement;
  const span = document.createElement(`span`);
  span.className = 'bytemd-status-error';

  const validateImageCount = (): boolean => {
    const imageCount = markdownBodyPreview?.querySelectorAll('img')?.length || 0;
    if (options.maxImageCount && imageCount > options.maxImageCount) {
      return false;
    }
    return true;
  };
  const validateCharCount = (): boolean => {
    const count = markdownBodyPreview?.textContent?.length || 0;
    if (options.maxLength && count > options.maxLength) {
      return false;
    }
    return true;
  };

  /**
   * 给editorCtx扩展校验相关的方法
   * @param editorCtx
   * @param markdownBody
   */
  function extendValidateFn(editorCtx: BytemdEditorContext, markdownBody: HTMLElement) {
    if (editorCtx && markdownBody && !editorCtx.validate) {
      // hack
      editorCtx.validate = (): boolean => {
        return validateImageCount() && validateCharCount();
      };
      editorCtx.validateImageCount = validateImageCount;
      editorCtx.validateCharCount = validateCharCount;
    }
  }

  return {
    editorEffect(ctx) {
      if (!editorCtx) {
        editorCtx = ctx;
      }
      options.setEditor?.(ctx);
      extendValidateFn(ctx, markdownBodyPreview);
    },
    viewerEffect({ markdownBody }) {
      if (!markdownBodyPreview) {
        markdownBodyPreview = markdownBody;
      }
      if (editorCtx) {
        // 设置字符数
        const count = markdownBody.textContent?.length || 0;
        const charCountEle: HTMLElement | null = editorCtx.root.querySelector('.bytemd-status-left span strong');
        if (charCountEle) {
          charCountEle.innerText = `${count}`;
        }

        // 字符数超出的提示
        const statusLeftContainer: HTMLElement | null = editorCtx.root.querySelector('.bytemd-status-left');
        if (statusLeftContainer) {
          if (!validateImageCount()) {
            // 图片数超出的提示
            span.innerText = '已达最大图片数限制';
            if (!statusLeftContainer.querySelector('.bytemd-status-error')) {
              statusLeftContainer.appendChild(span);
            }
          } else if (!validateCharCount()) {
            span.innerText = '已达最大字符数限制';
            if (!statusLeftContainer.querySelector('.bytemd-status-error')) {
              statusLeftContainer.appendChild(span);
            }
          } else {
            // 移除提示
            const n = statusLeftContainer.querySelector('.bytemd-status-error');
            n && statusLeftContainer.removeChild(n);
          }
        }
      }
      extendValidateFn(editorCtx, markdownBody);
    }
  };
}
