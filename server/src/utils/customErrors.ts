export class NotFoundError extends Error {
    statusCode = 404;
    constructor(message: string = 'Not Found') {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class BadRequestError extends Error {
    statusCode = 400;
    constructor(message: string = 'Bad Request') {
        super(message);
        this.name = 'BadRequestError';
    }
}

export class UnauthenticatedError extends Error {
    statusCode = 401;
    constructor(message: string = 'Unauthorized') {
        super(message);
        this.name = 'UnauthenticatedError';
    }
}

export class UnauthorizedError extends Error {
    statusCode = 403;
    constructor(message: string = 'Forbidden') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

export class ConflictError extends Error {
    statusCode = 409;
    constructor(message: string = 'Conflict') {
        super(message);
        this.name = 'ConflictError';
    }
}

export const customErrorNames = [
    NotFoundError.name,
    BadRequestError.name,
    UnauthenticatedError.name,
    UnauthorizedError.name,
    ConflictError.name,
];
