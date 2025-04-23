export class HTTPError extends Error {
    statusCode = 0;

    constructor(
        message: string,
        statusCode: number,
        name: string = 'HTTPError'
    ) {
        super(message);
        this.statusCode = statusCode;
        this.name = name;
    }
}

export class HTTPNotFoundError extends HTTPError {
    constructor(message: string = 'Not Found') {
        super(message, 404, 'HTTPNotFoundError');
    }
}
export class HTTPBadRequestError extends HTTPError {
    constructor(message: string = 'Bad Request') {
        super(message, 400, 'HTTPBadRequestError');
    }
}

export class HTTPUnauthenticatedError extends HTTPError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'HTTPUnauthenticatedError');
    }
}

export class HTTPUnauthorizedError extends HTTPError {
    constructor(message: string = 'Forbidden') {
        super(message, 403, 'HTTPUnauthorizedError');
    }
}

export class HTTPConflictError extends HTTPError {
    constructor(message: string = 'Conflict') {
        super(message, 409, 'HTTPConflictError');
    }
}
