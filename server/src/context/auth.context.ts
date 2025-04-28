import { AsyncLocalStorage } from 'async_hooks';

class AuthContextStorage extends AsyncLocalStorage<Map<string, any>> {
    constructor() {
        super();
    }

    setContext(key: string, value: any) {
        this.getStore()?.set(key, value);
    }

    getContext(key: string) {
        return this.getStore()?.get(key);
    }
}

const authContextStorage = new AuthContextStorage();

export default authContextStorage;
