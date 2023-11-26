import { NextFunction, Request, Response } from 'express'
import { UnauthorizedError } from '../helpers/api-erros'
import jwt from 'jsonwebtoken'

import { users } from '../controllers/UserController'

type JwtPayload = {
	id: number
}

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { authorization } = req.headers

	if (!authorization) {
		throw new UnauthorizedError('Não autorizado')
	}

	const token = authorization.split(' ')[1]

	const { id } = jwt.verify(token, process.env.JWT_PASS ?? '') as JwtPayload

	const user = users.find((user) => {
		return String(user.id) === String(id);
	});

	if (!user) {
		throw new UnauthorizedError('Não autorizado')
	}

	const { password: _, ...loggedUser } = user

	req.user = loggedUser

	next()
}
