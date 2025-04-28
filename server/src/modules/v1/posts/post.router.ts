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

const postRouter = Router();

const postController = new PostController();

postRouter.post(
    '/posts',
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
