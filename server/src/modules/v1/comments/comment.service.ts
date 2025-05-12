import authContextStorage from '#src/context/auth.context';
import { HTTPNotFoundError } from '#src/utils/errors/http.error';
import {
    filterNullValues,
    filterUndefinedValues,
} from '#src/utils/generic.util';
import PostRepository from '../posts/post.repository';
import CommentRepository from './comment.repository';

export default class CommentService {
    private readonly commentRepository = new CommentRepository();
    private readonly postRepository = new PostRepository();

    public createComment = async ({
        content,
        postId,
    }: {
        content: string;
        postId: number;
    }) => {
        const existingPost = await this.postRepository.findPostById(postId);

        if (existingPost === null) {
            throw new HTTPNotFoundError('Not found: post');
        }

        // authorId from jwt token
        const newComment = await this.commentRepository.createComment({
            content,
            postId,
            authorId: authContextStorage.getContext('userId'),
        });

        return newComment;
    };

    public getComments = async () => {
        const comments = await this.commentRepository.findComments();

        return comments;
    };

    public getCommentsOfPost = async (postId: number) => {
        const comments = await this.commentRepository.findCommentsByPostId(
            postId
        );

        return comments;
    };

    public getComment = async (id: number) => {
        const comment = await this.commentRepository.findCommentById(id);

        if (comment === null) {
            throw new HTTPNotFoundError('Not found: comment');
        }

        return comment;
    };

    public updateComment = async (
        id: number,
        { content }: { content: string }
    ) => {
        // only update comment when authorId matches userId from jwt, i.e only comment owner can update comment
        const updatedComment = await this.commentRepository.updateComment(
            id,
            authContextStorage.getContext('userId'),
            { ...filterUndefinedValues({ ...filterNullValues({ content }) }) }
        );

        return updatedComment;
    };

    public deleteComment = async (id: number) => {
        const deletedComment = await this.commentRepository.deleteComment(
            id,
            authContextStorage.getContext('userId')
        );

        return deletedComment;
    };
}
