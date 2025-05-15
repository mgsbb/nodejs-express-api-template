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

    public createUser = async ({
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

        const accessToken = this.generateAccessToken({ userId: user.id });
        const { refreshToken, refreshTokenJwtId } = this.generateRefreshToken({
            userId: user.id,
        });

        const accessCookieExpiry = this.expiryStringToMilliseconds(
            config.COOKIE_EXPIRY_ACCESS_TOKEN as DateStringValue
        );
        const refreshCookieExpiry = this.expiryStringToMilliseconds(
            config.COOKIE_EXPIRY_REFRESH_TOKEN as DateStringValue
        );

        // save refresh token to db
        await this.authRepository.createRefreshToken({
            userId: user.id,
            jti: refreshTokenJwtId,
            expiresAt: this.expiryStringToDate(
                config.JWT_EXPIRY_REFRESH_TOKEN as DateStringValue
            ),
        });

        return {
            user: { name: user.name, email: user.email, id: user.id },
            accessToken,
            refreshToken,
            accessCookieExpiry,
            refreshCookieExpiry,
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

        const accessToken = this.generateAccessToken({ userId: user.id });
        const { refreshToken, refreshTokenJwtId } = this.generateRefreshToken({
            userId: user.id,
        });

        const accessCookieExpiry = this.expiryStringToMilliseconds(
            config.COOKIE_EXPIRY_ACCESS_TOKEN as DateStringValue
        );
        const refreshCookieExpiry = this.expiryStringToMilliseconds(
            config.COOKIE_EXPIRY_REFRESH_TOKEN as DateStringValue
        );

        // save refresh token to db
        await this.authRepository.createRefreshToken({
            userId: user.id,
            jti: refreshTokenJwtId,
            expiresAt: this.expiryStringToDate(
                config.JWT_EXPIRY_REFRESH_TOKEN as DateStringValue
            ),
        });

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
        newPassword: string
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
            console.log(123);
            throw new HTTPUnauthorizedError('Unauthorized');
        }

        const updatedUser = await this.authRepository.updateUser(
            id,
            {
                password: await this.hashPassword(newPassword),
            },
            { includePassword: false }
        );

        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
        };
    };

    public refreshTokens = async (currentRefreshToken: string | undefined) => {
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

        // at this point, refresh token is valid, not expired and not revoked.
        // proceed to generate new tokens

        const newAccessToken = this.generateAccessToken({
            userId: decodedToken.userId,
        });
        const {
            refreshToken: newRefreshToken,
            refreshTokenJwtId: newRefreshTokenJwtId,
        } = this.generateRefreshToken({
            userId: decodedToken.userId,
        });

        const accessCookieExpiry = this.expiryStringToMilliseconds(
            config.COOKIE_EXPIRY_ACCESS_TOKEN as DateStringValue
        );
        const refreshCookieExpiry = this.expiryStringToMilliseconds(
            config.COOKIE_EXPIRY_REFRESH_TOKEN as DateStringValue
        );

        // save new refresh token to db
        await this.authRepository.createRefreshToken({
            userId: decodedToken.userId,
            jti: newRefreshTokenJwtId,
            expiresAt: this.expiryStringToDate(
                config.JWT_EXPIRY_REFRESH_TOKEN as DateStringValue
            ),
        });

        // revoke existing refresh token
        await this.authRepository.updateRefreshToken(decodedToken.jti, {
            isRevoked: true,
            replacedBy: newRefreshTokenJwtId,
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            accessCookieExpiry,
            refreshCookieExpiry,
        };
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

    private generateAccessToken = (payload: TokenPayload) => {
        return jwt.sign(payload, config.JWT_SECRET_ACCESS_TOKEN, {
            algorithm: 'HS256',
            expiresIn: config.JWT_EXPIRY_ACCESS_TOKEN as DateStringValue,
        });
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
        }
    };
}
