import { JwtPayload } from 'jsonwebtoken';

declare module 'jsonwebtoken' {
    interface TokenPayload extends JwtPayload {
        user: { id: number; name: string; email: string };
    }
}
