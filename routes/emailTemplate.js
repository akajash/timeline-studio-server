import express from 'express'

import auth from '../middleware/auth.js'

import { fetchAll,createTemplate, deleteTemplate, updateTemplate, fetchTemplateDD } from '../controllers/emailTemplate.js';

const router = express.Router()

router.get("/",auth,fetchAll);
router.get("/all",auth,fetchTemplateDD);
router.post("/create",auth,createTemplate);
router.patch("/update/:id",auth,updateTemplate);
router.delete("/delete/:id",auth,deleteTemplate);


export default router;