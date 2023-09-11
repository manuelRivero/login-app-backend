import {Router} from "express";
import { posts } from "../../controllers/posts/index.js";


const router = Router();


router.get('/', posts.do)

export default router