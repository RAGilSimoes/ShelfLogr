import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import {
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

defineCustomElements(window);

const queryClient = new QueryClient();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
