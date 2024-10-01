import { createRoutesFromChildren, matchRoutes, Routes, useLocation, useNavigationType } from 'react-router-dom';
import { createReactRouterV6Options, getWebInstrumentations, initializeFaro, ReactIntegration } from '@grafana/faro-react';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export const initFaro = () => {
return initializeFaro({
  url: 'https://faro-collector-prod-eu-west-2.grafana.net/collect/ea5284621142dec3268388718e2edb70',
  app: {
    name: 'Occupi-web',
    version: '1.0.0',
    environment: 'production'
  },
  
  instrumentations: [
    // Mandatory, omits default instrumentations otherwise.
    ...getWebInstrumentations(),

    new TracingInstrumentation(),

    // React integration for React applications.
     new ReactIntegration({
      router: createReactRouterV6Options({
        createRoutesFromChildren,
        matchRoutes,
        Routes,
        useLocation,
        useNavigationType,
      }),
    }),
  ],
});
}