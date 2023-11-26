import 'express-async-errors'
import express from 'express'
import { errorMiddleware } from './middlewares/error'
import routes from './routes'

import * as dotenv from 'dotenv';
dotenv.config();

const app = express()

app.use(express.json())

app.use(routes)

app.use(errorMiddleware)

app.listen(process.env.PORT || 3000)