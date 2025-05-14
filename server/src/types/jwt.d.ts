import { JwtPayload } from 'jsonwebtoken';

declare module 'jsonwebtoken' {
    interface TokenPayload extends JwtPayload {
        userId: number;
    }
}
