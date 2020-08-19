import React from 'react';
import { BrowserDetect } from '../utils/browserDetect';

export const browserContext = React.createContext({
    Browser: new BrowserDetect(),
});
