import { Request, Response } from 'express'
import { BadRequestError } from '../helpers/api-erros'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export let users: User[] = [];
export interface User {
	id?: string,
	name?: string;
	email?: string;
	password?: string;
}
export class UserController {
	async getAll(req: Request, res: Response) {
		return res.status(200).json(users)
	}

	async create(req: Request, res: Response) {
		const { name, email, password } = req.body

		const userExists = users.some((user) => user.email === email);

		if (userExists) {
			throw new BadRequestError('E-mail já existe')
		}

		const hashPassword = await bcrypt.hash(password, 10)

		const newUser = {
			id: JSON.stringify(Math.random()*1000000000000000),
			name,
			email,
			password: hashPassword,
		};

		users.push(newUser);

		return res.status(201).json(newUser)
	}

	async login(req: Request, res: Response) {
		const { email, password } = req.body

		const user = users.find((user) => user.email === email)

		if (!user) {
			throw new BadRequestError('E-mail ou senha inválidos')
		}

		const verifyPass = await bcrypt.compare(password, user.password as string)

		if (!verifyPass) {
			throw new BadRequestError('E-mail ou senha inválidos')
		}

		let token: string | undefined;

		token = jwt.sign({ id: user.id }, process.env.JWT_PASS ?? '', {
			expiresIn: '8h',
		})

		const { password: _, ...userLogin } = user

		return res.status(200).json({
			user: userLogin,
			token: token,
		})
	}

	async getProfile(req: Request, res: Response) {
		return res.json(req.user)
	}
}
