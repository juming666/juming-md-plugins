import type { BytemdEditorContext } from 'bytemd';

declare module 'bytemd' {
  interface BytemdEditorContext {
    /** 字符数和图片数的校验函数 */
    validate: () => boolean;
    /** 图片数的校验函数 */
    validateImageCount: () => boolean;
    /** 字符数的校验函数 */
    validateCharCount: () => boolean;
  }
}

export interface PluginValidateOptions {
  /** 向外暴露BytemdEditorContext的回调 */
  setEditor?: (ctx: BytemdEditorContext) => void;
  /** 最大字符数 */
  maxLength?: number;
  /** 图片最大数量 */
  maxImageCount?: number;
}
