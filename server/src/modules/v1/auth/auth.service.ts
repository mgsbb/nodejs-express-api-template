import {
    HTTPUnauthenticatedError,
    HTTPUnauthorizedError,
} from '#src/utils/errors/http.error';
import AuthRepository from './auth.repository';
import bcrypt from 'bcryptjs';
import jwt, { TokenPayload } from 'jsonwebtoken';
import config from '#src/config';
import authContextStorage from '#src/context/auth.context';
import { randomUUID } from 'crypto';

type DateStringValue = `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

export default class AuthService {
    private readonly authRepository;

    public constructor(authRepository: AuthRepository) {
        this.authRepository = authRepository;
    }

    public registerUser = async ({
        email,
        password,
        name,
    }: {
        email: string;
        password: string;
        name: string | null;
    }) => {
        const user = await this.createUser({ email, password, name });

        const {
            accessCookieExpiry,
            accessToken,
            refreshCookieExpiry,
            refreshToken,
        } = await this.generateAndPersistTokens(user.id);

        return {
            user,
            accessCookieExpiry,
            accessToken,
            refreshCookieExpiry,
            refreshToken,
        };
    };

    private createUser = async ({
        email,
        name,
        password,
    }: {
        email: string;
        password: string;
        name: string | null;
    }) => {
        const hashedPassword = await this.hashPassword(password);

        const user = await this.authRepository.createUser({
            email,
            password: hashedPassword,
            name,
        });

        return {
            name: user.name,
            email: user.email,
            id: user.id,
        };
    };

    public loginUser = async ({
        email,
        password,
    }: {
        email: string;
        password: string;
    }) => {
        const user = await this.authRepository.getUserByEmail(email, {
            includePassword: true,
        });

        if (user === null) {
            throw new HTTPUnauthenticatedError('Invalid credentials');
        }

        if (!(await this.comparePassword(password, user?.password))) {
            throw new HTTPUnauthenticatedError('Invalid credentials');
        }

        const {
            accessToken,
            refreshToken,
            accessCookieExpiry,
            refreshCookieExpiry,
        } = await this.generateAndPersistTokens(user.id);

        return {
            user: { id: user.id, name: user.name, email: user.email },
            accessToken,
            refreshToken,
            accessCookieExpiry,
            refreshCookieExpiry,
        };
    };

    public updateUserPassword = async (
        oldPassword: string,
        newPassword: string,
        currentRefreshToken: string | undefined
    ) => {
        const id = authContextStorage.getContext('userId');

        const user = await this.authRepository.findUserById(id, {
            includePassword: true,
        });

        // this will never be case, as id is from the token of a registered and logged in user
        // if (user === null) {
        //     throw new HTTPNotFoundError('user not found');
        // }

        if (!(await this.comparePassword(oldPassword, user?.password || ''))) {
            throw new HTTPUnauthorizedError('Unauthorized');
        }

        const updatedUser = await this.authRepository.updateUser(
            id,
            {
                password: await this.hashPassword(newPassword),
            },
            { includePassword: false }
        );

        const {
            accessCookieExpiry,
            refreshCookieExpiry,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            refreshTokenJwtId: newRefreshTokenJwtId,
        } = await this.generateAndPersistTokens(id);

        try {
            // if the refresh token is valid, not revoked and not expired, then revoke the token in the database
            const decodedToken = await this.verifyRefreshToken(
                currentRefreshToken
            );

            // revoke existing refresh token
            await this.authRepository.updateRefreshToken(
                // check if decodedToken.jti is undefined is already performed in verifyRefreshToken method
                decodedToken.jti as string,
                {
                    isRevoked: true,
                    replacedBy: newRefreshTokenJwtId,
                }
            );
        } catch (error) {
            // but if the refresh token is invalid, do nothing
        }

        return {
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
            },
            accessCookieExpiry,
            refreshCookieExpiry,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            refreshTokenJwtId: newRefreshTokenJwtId,
        };
    };

    public refreshTokens = async (currentRefreshToken: string | undefined) => {
        const decodedToken = await this.verifyRefreshToken(currentRefreshToken);

        // at this point, refresh token is valid, not expired and not revoked.
        // proceed to generate new tokens

        const {
            accessCookieExpiry,
            refreshCookieExpiry,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            refreshTokenJwtId: newRefreshTokenJwtId,
        } = await this.generateAndPersistTokens(decodedToken.userId);

        // revoke existing refresh token
        await this.authRepository.updateRefreshToken(
            // check if decodedToken.jti is undefined is already performed in verifyRefreshToken method
            decodedToken.jti as string,
            {
                isRevoked: true,
                replacedBy: newRefreshTokenJwtId,
            }
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            accessCookieExpiry,
            refreshCookieExpiry,
        };
    };

    public logoutUser = async (currentRefreshToken: string | undefined) => {
        try {
            // if the refresh token is valid, not revoked and not expired, then revoke the token in the database
            const decodedToken = await this.verifyRefreshToken(
                currentRefreshToken
            );

            // revoke existing refresh token
            await this.authRepository.updateRefreshToken(
                // check if decodedToken.jti is undefined is already performed in verifyRefreshToken method
                decodedToken.jti as string,
                {
                    isRevoked: true,
                }
            );
        } catch (error) {
            // but if the refresh token is invalid, log the user out regardless
        }
    };

    private comparePassword = async (
        password: string,
        hashedPassword: string
    ) => {
        return await bcrypt.compare(password, hashedPassword);
    };

    private hashPassword = async (password: string, rounds: number = 10) => {
        const salt = await bcrypt.genSalt(rounds);

        const hashedPassword = await bcrypt.hash(password, salt);

        return hashedPassword;
    };

    private verifyRefreshToken = async (
        currentRefreshToken: string | undefined
    ) => {
        if (currentRefreshToken === undefined) {
            throw new HTTPUnauthenticatedError('Unauthenticated');
        }

        const decodedToken = jwt.verify(
            currentRefreshToken,
            config.JWT_SECRET_REFRESH_TOKEN
        ) as TokenPayload;

        // probably not possible for jti and userId to be undefined
        if (
            decodedToken.jti === undefined ||
            decodedToken.userId === undefined
        ) {
            throw new HTTPUnauthenticatedError('Unauthenticated');
        }

        const refreshTokenInDb =
            await this.authRepository.findRefreshTokenByJti(decodedToken.jti);

        // TODO: simluate usage of a revoked token
        if (
            refreshTokenInDb === null ||
            refreshTokenInDb.isRevoked ||
            refreshTokenInDb.expiresAt < new Date() ||
            // probably not possible for a different user id
            refreshTokenInDb.userId !== decodedToken.userId
        ) {
            throw new HTTPUnauthenticatedError('Unauthenticated');
        }

        return decodedToken;
    };

    private generateAndPersistTokens = async (userId: number) => {
        const { accessToken } = this.generateAccessToken({ userId });
        const { refreshToken, refreshTokenJwtId } = this.generateRefreshToken({
            userId,
        });

        const accessCookieExpiry = this.expiryStringToMilliseconds(
            config.COOKIE_EXPIRY_ACCESS_TOKEN as DateStringValue
        );
        const refreshCookieExpiry = this.expiryStringToMilliseconds(
            config.COOKIE_EXPIRY_REFRESH_TOKEN as DateStringValue
        );

        // save refresh token to db
        await this.authRepository.createRefreshToken({
            userId,
            jti: refreshTokenJwtId,
            expiresAt: this.expiryStringToDate(
                config.JWT_EXPIRY_REFRESH_TOKEN as DateStringValue
            ),
        });

        return {
            accessToken,
            refreshToken,
            accessCookieExpiry,
            refreshCookieExpiry,
            refreshTokenJwtId,
        };
    };

    private generateAccessToken = (payload: TokenPayload) => {
        const accessTokenJwtId = randomUUID()

        const accessToken = jwt.sign(payload, config.JWT_SECRET_ACCESS_TOKEN, {
            algorithm: 'HS256',
            expiresIn: config.JWT_EXPIRY_ACCESS_TOKEN as DateStringValue,
            jwtid: accessTokenJwtId
        });

        return { accessToken, accessTokenJwtId }
    };

    private generateRefreshToken = (payload: TokenPayload) => {
        const refreshTokenJwtId = randomUUID();

        const refreshToken = jwt.sign(
            payload,
            config.JWT_SECRET_REFRESH_TOKEN,
            {
                algorithm: 'HS256',
                expiresIn: config.JWT_EXPIRY_REFRESH_TOKEN as DateStringValue,
                // when token is decoded (using verify/decode), it is available as jti
                jwtid: refreshTokenJwtId,
            }
        );

        return { refreshToken, refreshTokenJwtId };
    };

    /**
     *
     * @param expiry values in the format {value}{unit} like 60s, 1m, 2h, 7d, 3w, 1y
     * @returns current date + input value
     */
    private expiryStringToDate = (expiry: DateStringValue) => {
        const value = parseInt(expiry.match(/\d+/)?.[0] ?? '0');
        const unit = expiry.match(/[a-zA-Z]/)?.[0];

        const date = new Date();

        switch (unit) {
            case 's':
                date.setSeconds(date.getSeconds() + value);
                break;
            case 'm':
                date.setMinutes(date.getMinutes() + value);
                break;
            case 'h':
                date.setHours(date.getHours() + value);
                break;
            case 'd':
                date.setDate(date.getDate() + value);
                break;
            case 'w':
                date.setDate(date.getDate() + value * 7);
                break;
            case 'y':
                date.setFullYear(date.getFullYear() + value);
                break;
        }

        return date;
    };

    /**
     *
     * @param expiry values in the format {value}{unit} like 60s, 1m, 2h, 7d, 3w, 1y
     * @returns value in milliseconds
     */
    private expiryStringToMilliseconds = (expiry: DateStringValue) => {
        const value = parseInt(expiry.match(/\d+/)?.[0] ?? '0');
        const unit = expiry.match(/[a-zA-Z]/)?.[0];

        switch (unit) {
            case 's':
                return value * 1000;
            case 'm':
                return value * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            case 'w':
                return value * 7 * 24 * 60 * 60 * 1000;
            case 'y':
                return value * 365 * 24 * 60 * 60 * 1000;
            default:
                return 60 * 60 * 1000;
        }
    };
}
