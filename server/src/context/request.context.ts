import { AsyncLocalStorage } from 'async_hooks';

class RequestContextStorage extends AsyncLocalStorage<Map<string, any>> {
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

const requestContextStorage = new RequestContextStorage();

export default requestContextStorage;

// export const requestContextStorage = new AsyncLocalStorage<Map<string, any>>();

// export async function setRequestContext(key: string, value: any) {
//     const store = requestContextStorage.getStore() || new Map();
//     store.set(key, value);
//     // requestContextStorage.enterWith(store);
// }

// export function getRequestContext(key: string) {
//     const store = requestContextStorage.getStore();
//     return store?.get(key);
// }
