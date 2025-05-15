import { type Response, type RequestHandler } from 'express';
import AuthService from './auth.service';
import { User } from '#src/generated/prisma';
import config from '#src/config';

export default class AuthController {
    private readonly authService;

    public constructor(authService: AuthService) {
        this.authService = authService;
    }

    public handleRegisterUser: RequestHandler = async (req, res) => {
        const { name, email, password } = req.body as User;

        const {
            user,
            accessToken,
            refreshToken,
            accessCookieExpiry,
            refreshCookieExpiry,
        } = await this.authService.registerUser({
            email,
            name,
            password,
        });

        this.setTokensInCookies(res, {
            accessCookieExpiry,
            accessToken,
            refreshCookieExpiry,
            refreshToken,
        });

        res.status(201).json({ message: 'Created: user', data: { user } });
    };

    public handleLoginUser: RequestHandler = async (req, res) => {
        const { email, password } = req.body as User;

        const {
            accessToken,
            refreshToken,
            user,
            accessCookieExpiry,
            refreshCookieExpiry,
        } = await this.authService.loginUser({
            email,
            password,
        });

        this.setTokensInCookies(res, {
            accessCookieExpiry,
            accessToken,
            refreshCookieExpiry,
            refreshToken,
        });

        res.status(200).json({ message: 'Logged in', data: { user } });
    };

    public handleUpdateUserPassword: RequestHandler = async (req, res) => {
        const { oldPassword, newPassword } = req.body;

        await this.authService.updateUserPassword(oldPassword, newPassword);

        res.status(200).json({ message: 'Updated: user password' });
    };

    public handleRefreshTokens: RequestHandler = async (req, res) => {
        const currentRefreshToken = req.cookies.refreshToken as
            | string
            | undefined;

        const {
            accessCookieExpiry,
            accessToken: newAccessToken,
            refreshCookieExpiry,
            refreshToken: newRefreshToken,
        } = await this.authService.refreshTokens(currentRefreshToken);

        this.setTokensInCookies(res, {
            accessCookieExpiry,
            accessToken: newAccessToken,
            refreshCookieExpiry,
            refreshToken: newRefreshToken,
        });

        res.sendStatus(204);
    };

    public handleLogoutUser: RequestHandler = async (req, res) => {
        const currentRefreshToken = req.cookies.refreshToken;

        await this.authService.logoutUser(currentRefreshToken);

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken', { path: '/api/v1/auth' });

        res.sendStatus(204);
    };

    private setTokensInCookies = (
        res: Response,
        {
            accessToken,
            accessCookieExpiry,
            refreshToken,
            refreshCookieExpiry,
        }: {
            accessToken: string;
            accessCookieExpiry: number;
            refreshToken: string;
            refreshCookieExpiry: number;
        }
    ) => {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: accessCookieExpiry,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: refreshCookieExpiry,
            path: '/api/v1/auth',
        });
    };
}
