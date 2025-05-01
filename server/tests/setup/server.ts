import app from '../../src/app';

export function initializeServer() {
    let port = 3001;
    const server = app.listen(3001, () => {
        console.log(`Server running at http://localhost:${port}`);
    });

    return server;
}
