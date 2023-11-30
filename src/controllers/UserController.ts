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

	async delete(req: Request, res: Response) {
		const { id } = req.user;

		const userIndex = users.findIndex(user => user.id === id);

		if (userIndex === -1) {
			return new BadRequestError("Usuário não encontrado")
		}

		users.splice(userIndex, 1);

		return res.status(200).json({ users, message: 'Usuário deletado com sucesso' })
	}

	async create(req: Request, res: Response) {
		const { name, email, password } = req.body

		const userExists = users.some((user) => user.email === email);

		if (userExists) {
			throw new BadRequestError('E-mail já existe')
		}

		const hashPassword = await bcrypt.hash(password, 10)

		const newUser = {
			id: JSON.stringify(Math.random() * 1000000000000000),
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

	async edit(req: Request, res: Response) {
		const { id } = req.user;
		const { name, email } = req.body

		const userIndex = users.findIndex(user => user.id === id);

		if (userIndex === -1) {
			return new BadRequestError("Usuário não encontrado")
		}

		users[userIndex] = { ...users[userIndex], name, email };

		return res.status(200).json({ users, message: 'Usuário atualizado com sucesso' })
	}
}
