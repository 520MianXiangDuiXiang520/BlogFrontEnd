export const storage = {
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    },
    getDefault(key, _default) {
        const v = this.get(key);
        return v?v:_default;
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};
