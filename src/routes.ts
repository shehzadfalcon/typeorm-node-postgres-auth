import {Router} from "express";
import {Login, Logout, Register} from "./controller/auth.controller";
import {AuthenticatedUser, Refresh } from "./middleware/auth"

export const routes = (router: Router) => {
    router.post('/api/register', Register);
    router.post('/api/login', Refresh, AuthenticatedUser, Login);
    router.post('/api/logout', Logout);
}
