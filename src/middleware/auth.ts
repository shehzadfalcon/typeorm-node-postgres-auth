import {Request, Response} from "express";
import {getRepository, MoreThanOrEqual} from "typeorm";
import {User} from "../entity/user.entity";
import {sign, verify} from 'jsonwebtoken';
import {Token} from "../entity/token.entity";

export const AuthenticatedUser = async (req: Request, res: Response) => {
    try {
        const accessToken = req.header('Authorization')?.split(" ")[1] || "";

        const payload: any = verify(accessToken, "access_secret");

        if (!payload) {
            return res.status(401).send({
                message: 'unauthenticated'
            });
        }

        const user = await getRepository(User).findOne(payload.id);

        if (!user) {
            return res.status(401).send({
                message: 'unauthenticated'
            });
        }

        const {password, ...data} = user;

        res.send(data);
    } catch (e) {
        return res.status(401).send({
            message: 'unauthenticated'
        });
    }
}
export const Refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies['refreshToken'];

        const payload: any = verify(refreshToken, "refresh_secret");

        if (!payload) {
            return res.status(401).send({
                message: 'unauthenticated'
            });
        }

        const dbToken = await getRepository(Token).findOne({
            user_id: payload.id,
            expired_at: MoreThanOrEqual(new Date())
        });

        if (!dbToken) {
            return res.status(401).send({
                message: 'unauthenticated'
            });
        }

        const token = sign({
            id: payload.id
        }, "access_secret", {expiresIn: '30s'});

        res.send({
            token
        })
    } catch (e) {
        return res.status(401).send({
            message: 'unauthenticated'
        });
    }
}