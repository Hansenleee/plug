import { createContext } from 'react';

export interface AppContextValue {
  showLLMConfig: () => void;
}

export const AppContext = createContext<AppContextValue>({ showLLMConfig: () => {} });
