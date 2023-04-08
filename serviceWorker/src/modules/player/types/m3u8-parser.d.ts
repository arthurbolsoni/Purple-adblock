declare module 'm3u8-parser' {
    export class Parser {
      addTagMapper(parser: any): void;
      addParser(parser: any): void;
      manifest: any;
      push(data: string): void;
      end(): void;
    }
  }