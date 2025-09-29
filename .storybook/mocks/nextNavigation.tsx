import React from 'react';

// Mock for next/navigation hooks used in App Router components
export const useRouter = () => ({
  push: (path: string) => {
    console.info('[useRouter.push]', path);
    // In a real app this would navigate, in Storybook we just log
  },
  replace: (path: string) => {
    console.info('[useRouter.replace]', path);
  },
  back: () => {
    console.info('[useRouter.back]');
  },
  forward: () => {
    console.info('[useRouter.forward]');
  },
  refresh: () => {
    console.info('[useRouter.refresh]');
  },
  prefetch: (path: string) => {
    console.info('[useRouter.prefetch]', path);
  }
});

export const useSearchParams = () => {
  const params = new URLSearchParams();
  
  return {
    get: (key: string) => params.get(key),
    getAll: (key: string) => params.getAll(key),
    has: (key: string) => params.has(key),
    keys: () => params.keys(),
    values: () => params.values(),
    entries: () => params.entries(),
    toString: () => params.toString(),
    [Symbol.iterator]: () => params[Symbol.iterator]()
  };
};

export const usePathname = () => '/';

export const useParams = () => ({});

export const notFound = () => {
  console.info('[notFound] called');
  throw new Error('Not Found');
};

export const redirect = (path: string) => {
  console.info('[redirect]', path);
  throw new Error(`Redirecting to ${path}`);
};

// ReadonlyURLSearchParams mock
export class ReadonlyURLSearchParams extends URLSearchParams {
  constructor(init?: string | URLSearchParams | Record<string, string> | string[][] | undefined) {
    super(init);
  }
  
  // Override methods that would modify the params to throw
  append(): never {
    throw new Error('Cannot modify ReadonlyURLSearchParams');
  }
  
  delete(): never {
    throw new Error('Cannot modify ReadonlyURLSearchParams');
  }
  
  set(): never {
    throw new Error('Cannot modify ReadonlyURLSearchParams');
  }
  
  sort(): never {
    throw new Error('Cannot modify ReadonlyURLSearchParams');
  }
}