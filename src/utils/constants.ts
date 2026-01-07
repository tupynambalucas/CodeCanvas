import { tmpdir } from 'os';
import path from 'path';

export const EXTENSION_NAME = 'codecanvas';

export const BACKGROUND_VER = 'codecanvas.ver';
export const VERSION = '1.0.0'; // This should ideally be read from package.json
export const ENCODING = 'utf8';

// Path where a touch file is created to indicate first run or successful patch
export const TOUCH_FILE_PATH = path.join(tmpdir(), 'codecanvas.touch');