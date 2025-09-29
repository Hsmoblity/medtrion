import React from 'react';

export interface MockRouter {
  basePath: string;
  pathname: string;
  route: string;
  query: Record<string, any>;
  asPath: string;
  push: (...args: any[]) => Promise<boolean>;
  replace: (...args: any[]) => Promise<boolean>;
  reload: () => void;
  back: () => void;
  prefetch: (...args: any[]) => Promise<void>;
  beforePopState: (...args: any[]) => void;
  events: {
    on: (...args: any[]) => void;
    off: (...args: any[]) => void;
    emit: (...args: any[]) => void;
  };
  isFallback: boolean;
  isReady: boolean;
  isPreview: boolean;
  isLocaleDomain: boolean;
  locale?: string;
  locales?: string[];
  defaultLocale?: string;
}

export const defaultRouter: MockRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  push: async () => true,
  replace: async () => true,
  reload: () => undefined,
  back: () => undefined,
  prefetch: async () => undefined,
  beforePopState: () => undefined,
  events: {
    on: () => undefined,
    off: () => undefined,
    emit: () => undefined
  },
  isFallback: false,
  isReady: true,
  isPreview: false,
  isLocaleDomain: false,
  locale: 'en',
  locales: ['en'],
  defaultLocale: 'en'
};

export const RouterContext = React.createContext<MockRouter>(defaultRouter);

export const useRouter = () => React.useContext(RouterContext);

export const withRouter = <P extends { router: MockRouter }>(Component: React.ComponentType<P>) => {
  return function WithRouter(props: Omit<P, 'router'>) {
    const router = useRouter();
    return <Component {...(props as P)} router={router} />;
  };
};

export const createMockRouter = (overrides: Partial<MockRouter> = {}): MockRouter => ({
  ...defaultRouter,
  ...overrides,
  events: {
    ...defaultRouter.events,
    ...(overrides.events || {})
  }
});

export const Router = defaultRouter;

export default defaultRouter;
