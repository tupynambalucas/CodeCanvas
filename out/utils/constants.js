"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOUCH_FILE_PATH = exports.ENCODING = exports.VERSION = exports.BACKGROUND_VER = exports.EXTENSION_NAME = void 0;
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
exports.EXTENSION_NAME = 'codecanvas';
exports.BACKGROUND_VER = 'codecanvas.ver';
exports.VERSION = '1.0.0'; // This should ideally be read from package.json
exports.ENCODING = 'utf8';
// Path where a touch file is created to indicate first run or successful patch
exports.TOUCH_FILE_PATH = path_1.default.join((0, os_1.tmpdir)(), 'codecanvas.touch');
//# sourceMappingURL=constants.js.map