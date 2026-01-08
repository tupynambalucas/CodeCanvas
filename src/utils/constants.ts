import { tmpdir } from 'os';
import path from 'path';

export const EXTENSION_NAME = 'codecanvas';

export const BACKGROUND_VER = 'codecanvas.ver';
export const VERSION = '1.0.0'; // Synchronized with package.json
export const ENCODING = 'utf8';

export const TOUCH_FILE_PATH = path.join(tmpdir(), 'codecanvas.touch');
