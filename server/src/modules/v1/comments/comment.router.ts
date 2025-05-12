import { Router } from 'express';
import CommentController from './comment.controller';
import {
    validateInput,
    validateParam,
} from '#src/middlewares/validator.middleware';
import { postIdParamSchema } from '../posts/post.schema';
import {
    commentIdParamSchema,
    commentSchemaCreate,
    commentSchemaUpdate,
} from './comment.schema';
import { authenticateUser } from '#src/middlewares/auth.middleware';

const commentRouter = Router();

const commentController = new CommentController();

commentRouter.post(
    '/posts/:postId/comments',
    validateParam(postIdParamSchema),
    validateInput(commentSchemaCreate),
    authenticateUser,
    commentController.handleCreateComment
);
commentRouter.get(
    '/posts/:postId/comments',
    validateParam(postIdParamSchema),
    commentController.handleGetCommentsOfPost
);
commentRouter.get('/comments', commentController.handleGetComments);
commentRouter.get(
    '/comments/:commentId',
    validateParam(commentIdParamSchema),
    commentController.handleGetComment
);
commentRouter.patch(
    '/comments/:commentId',
    validateParam(commentIdParamSchema),
    validateInput(commentSchemaUpdate),
    authenticateUser,
    commentController.handleUpdateComment
);
commentRouter.delete(
    '/comments/:commentId',
    validateParam(commentIdParamSchema),
    authenticateUser,
    commentController.handleDeleteComment
);

export default commentRouter;
