import {Router } from 'express'
import { getImageByName } from '../controller/file.controller'
const fileRouter = Router()

fileRouter.get('/images/:imageName',getImageByName)

export default fileRouter