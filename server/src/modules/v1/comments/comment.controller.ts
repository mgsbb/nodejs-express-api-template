import { RequestHandler } from 'express';
import CommentService from './comment.service';
import { Comment } from '#src/generated/prisma';

export default class CommentController {
    private readonly commentService = new CommentService();

    public handleCreateComment: RequestHandler = async (req, res) => {
        const { postId } = req.params;
        const { content } = req.body as Comment;

        const newComment = await this.commentService.createComment({
            content,
            postId: Number(postId),
        });

        res.status(201).json({
            message: 'Created: comment',
            comment: newComment,
        });
    };

    public handleGetComments: RequestHandler = async (req, res) => {
        const comments = await this.commentService.getComments();

        res.status(200).json({ message: 'Fetched: all comments', comments });
    };

    public handleGetCommentsOfPost: RequestHandler = async (req, res) => {
        const { postId } = req.params;

        const comments = await this.commentService.getCommentsOfPost(
            Number(postId)
        );

        res.status(200).json({
            message: 'Fetched: comments of post',
            comments,
        });
    };

    public handleGetComment: RequestHandler = async (req, res) => {
        const { commentId } = req.params;

        const comment = await this.commentService.getComment(Number(commentId));

        res.status(200).json({ message: 'Fetched: comment', comment });
    };

    public handleUpdateComment: RequestHandler = async (req, res) => {
        const { commentId } = req.params;
        const { content } = req.body as Comment;

        const updatedComment = await this.commentService.updateComment(
            Number(commentId),
            { content }
        );

        res.status(200).json({
            message: 'Updated: comment',
            comment: updatedComment,
        });
    };

    public handleDeleteComment: RequestHandler = async (req, res) => {
        const { commentId } = req.params;

        await this.commentService.deleteComment(Number(commentId));

        res.sendStatus(204);
    };
}
