import {Request, Response} from "express";
import {getRepository, MoreThanOrEqual} from "typeorm";
import {User} from "../entity/user.entity";
import bcryptjs from 'bcryptjs';
import {sign, verify} from 'jsonwebtoken';
import {Token} from "../entity/token.entity";
import LoggerService from "../config/logger"

export const Register = async (req: Request, res: Response) => {
    try {
    const {name, email, password} = req.body;

    const user = await getRepository(User).save({
        name,
        email,
        password: await bcryptjs.hash(password, 12)
    });

    res.send(user);
}  catch (error)  {
    LoggerService.LoggerHandler(500, 'An error occurred', res, { error });
  }
}

export const Login = async (req: Request, res: Response) => {
    try{
    const {email, password} = req.body;

    const user = await getRepository(User).findOne({email});

    if (!user) {
        return res.status(400).send({
            message: 'Invalid credentials'
        })
    }

    if (!await bcryptjs.compare(password, user.password)) {
        return res.status(400).send({
            message: 'Invalid credentials'
        })
    }

    const refreshToken = sign({
        id: user.id
    }, "refresh_secret", {expiresIn: '1w'});

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
    });

    const expired_at = new Date();
    expired_at.setDate(expired_at.getDate() + 7);

    await getRepository(Token).save({
        user_id: user.id,
        token: refreshToken,
        expired_at
    });

    const token = sign({
        id: user.id
    }, "access_secret", {expiresIn: '30s'});

    res.send({
        token
    });
} catch (error)  {
    LoggerService.LoggerHandler(500, 'An error occurred', res, { error });
  }
}

export const Logout = async (req: Request, res: Response) => {
    try{
    const refreshToken = req.cookies['refreshToken'];

    await getRepository(Token).delete({token: refreshToken});

    res.cookie('refreshToken', '', {maxAge: 0});

    res.send({
        message: 'success'
    });
}
catch (error)  {
    LoggerService.LoggerHandler(500, 'An error occurred', res, { error });
  }
}
