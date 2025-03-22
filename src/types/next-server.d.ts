declare module 'next/server' {
  import { IncomingMessage, ServerResponse } from 'http';

  export type NextMiddleware = (
    req: IncomingMessage, 
    res: ServerResponse, 
    next: (err?: Error) => void
  ) => Promise<void> | void;

  export type NextRequest = IncomingMessage & {
    url: string;
    nextUrl: URL;
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): { name: string; value: string }[];
      set(name: string, value: string, options?: { path?: string; maxAge?: number }): void;
      delete(name: string): void;
    };
    headers: Headers;
    method: string;
    nextUrl: URL;
  };

  export type NextResponse = ServerResponse & {
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): { name: string; value: string }[];
      set(name: string, value: string, options?: { path?: string; maxAge?: number }): void;
      delete(name: string): void;
    };
    json(data: any): NextResponse;
    redirect(url: string | URL): NextResponse;
    rewrite(url: string | URL): NextResponse;
    next(): NextResponse;
  };
}