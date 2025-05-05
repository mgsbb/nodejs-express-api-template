import { Router } from 'express';
import PostController from './post.controller';
import {
    validateInput,
    validateParam,
} from '#src/middlewares/validator.middleware';
import {
    postIdParamSchema,
    postSchemaCreate,
    postSchemaUpdate,
} from './post.schema';
import { authenticateUser } from '#src/middlewares/auth.middleware';
import upload from '#src/middlewares/multer.middleware';

const postRouter = Router();

const postController = new PostController();

postRouter.post(
    '/posts',
    // when request headers is multipart/form-data, multer MUST appear before the validateInput in order to populate req.body with values. express.json() cannot handle multipart/form-data
    upload.single('image'),
    validateInput(postSchemaCreate),
    authenticateUser,
    postController.handleCreatePost
);
postRouter.get(
    '/posts/:postId',
    validateParam(postIdParamSchema),
    postController.handleGetPost
);
postRouter.get('/posts', postController.handleGetPosts);
postRouter.patch(
    '/posts/:postId',
    validateParam(postIdParamSchema),
    validateInput(postSchemaUpdate),
    authenticateUser,
    postController.handleUpdatePost
);
postRouter.delete(
    '/posts/:postId',
    validateParam(postIdParamSchema),
    authenticateUser,
    postController.handleDeletePost
);

export default postRouter;
