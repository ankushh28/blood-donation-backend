import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. Insufficient permissions' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        console.log(decoded, "decoded");
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
