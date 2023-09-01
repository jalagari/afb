import { applyRuleEngine } from '../rules/index.js';
import { transformFileDOM, transformFileRequest } from './attachments.js';
import { transformCaptchaDOM, transformCaptchaRequest } from './recaptcha.js';

export const transformers = [
  transformFileDOM,
  transformCaptchaDOM,
  applyRuleEngine,
];

export const asyncTransformers = [
];

export const requestTransformers = [
  transformCaptchaRequest,
  transformFileRequest,
];
