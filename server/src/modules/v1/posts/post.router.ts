import { Router } from 'express';
import PostController from './post.controller';
import {
    validateInput,
    validateParam,
    validateQuery,
} from '#src/middlewares/validator.middleware';
import {
    postIdParamSchema,
    postSchemaCreate,
    postSchemaQuery,
    postSchemaUpdate,
} from './post.schema';
import { authenticateUser } from '#src/middlewares/auth.middleware';
import upload from '#src/middlewares/multer.middleware';
import PostRepository from './post.repository';
import PostService from './post.service';

const postRouter = Router();

const postRepository = new PostRepository();
const postService = new PostService(postRepository);
const postController = new PostController(postService);

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
postRouter.get(
    '/posts',
    validateQuery(postSchemaQuery),
    postController.handleGetPosts
);
postRouter.patch(
    '/posts/:postId',
    upload.single('image'),
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
