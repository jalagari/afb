import { decorateCaptcha, transformCaptchaRequest } from './recaptcha.js';

export const transformers = [
  decorateCaptcha,
];

export const asyncTransformers = [
];

export const requestTransformers = [
  transformCaptchaRequest,
];
