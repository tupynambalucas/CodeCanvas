"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._ = void 0;
exports._ = new (class {
    /**
     * Wrap the script with IIFE (Immediately Invoked Function Expression)
     */
    withIIFE(script) {
        if (!script.trim()) {
            return '';
        }
        return `(function(){${script}})();`;
    }
})();
//# sourceMappingURL=_.js.map