import { type PassThrough } from 'node:stream';

export * from './IApiFile';
export * from './IFile';
export * from './ITranslationDecoratorInterface';
export interface IStream {
  pipe: (destination: PassThrough) => PassThrough;
}
