import { decorateFile, transformFileRequest } from './attachments.js';
import { decorateCaptcha, transformCaptchaRequest } from './recaptcha.js';

export const transformers = [
  decorateFile,
  decorateCaptcha,
];

export const asyncTransformers = [
];

export const requestTransformers = [
  transformCaptchaRequest,
  transformFileRequest,
];
