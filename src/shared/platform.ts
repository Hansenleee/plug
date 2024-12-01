import os from 'os';

export const isDarwin = () => os.platform() === 'darwin';
