import React from 'react';
import { Settings } from '../stores/settingsStore';

export const storesContext = React.createContext({
    Settings: new Settings(),
});
