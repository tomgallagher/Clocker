import React from 'react';
import { browserContext } from './../contexts/browserContext';

export const useBrowser = () => React.useContext(browserContext);
