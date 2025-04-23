export class AppError extends Error {
    statusCode = 0;

    constructor(
        message: string,
        statusCode: number,
        name: string = 'AppError'
    ) {
        super(message);
        this.statusCode = statusCode;
        this.name = name;
    }
}

export class HTTPNotFoundError extends AppError {
    constructor(message: string = 'Not Found') {
        super(message, 404, 'HTTPNotFoundError');
    }
}
export class HTTPBadRequestError extends AppError {
    constructor(message: string = 'Bad Request') {
        super(message, 400, 'HTTPBadRequestError');
    }
}

export class HTTPUnauthenticatedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'HTTPUnauthenticatedError');
    }
}

export class HTTPUnauthorizedError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403, 'HTTPUnauthorizedError');
    }
}

export class HTTPConflictError extends AppError {
    constructor(message: string = 'Conflict') {
        super(message, 409, 'HTTPConflictError');
    }
}
