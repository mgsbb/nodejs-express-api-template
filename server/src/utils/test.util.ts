export function mockModule<T>(module: T) {
    return module as jest.Mocked<T>;
}
