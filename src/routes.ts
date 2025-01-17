import { Router } from 'express'
import { UserController } from './controllers/UserController'
import { authMiddleware } from './middlewares/authMiddleware'

const routes = Router()

routes.get('/users', new UserController().getAll)
routes.post('/user', new UserController().create)
routes.post('/login', new UserController().login)
routes.delete('/user/:id', new UserController().deleteNoAuth)

routes.use(authMiddleware)

routes.get('/profile', new UserController().getProfile)
routes.put('/user/edit', new UserController().edit)
routes.delete('/user', new UserController().delete)

export default routes
