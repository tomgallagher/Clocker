import React from 'react';
import { Settings } from '../stores/settingsStore';
import { JobStore } from '../stores/jobStore';

export const storesContext = React.createContext({
    Settings: new Settings(),
    JobStore: new JobStore(),
});
