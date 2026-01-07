export const _ = new (class {
    /**
     * Wrap the script with IIFE (Immediately Invoked Function Expression)
     */
    public withIIFE(script: string) {
        if (!script.trim()) {
            return '';
        }
        return `(function(){${script}})();`;
    }
})();
