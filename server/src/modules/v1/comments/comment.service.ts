import authContextStorage from '#src/context/auth.context';
import { Comment } from '#src/generated/prisma';
import { HTTPNotFoundError } from '#src/utils/errors/http.error';
import { filterUndefinedValues } from '#src/utils/generic.util';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';

export default class CommentService {
    public createComment = async ({
        content,
        postId,
    }: Pick<Comment, 'content' | 'postId'>) => {
        const existingPost = await prismaClient.post.findUnique({
            where: { id: postId },
        });

        if (existingPost === null) {
            throw new HTTPNotFoundError('post not found');
        }

        // authorId from jwt token
        const newComment = await prismaClient.comment.create({
            data: {
                content,
                postId,
                authorId: authContextStorage.getContext('userId'),
            },
        });

        return newComment;
    };

    public getComments = async () => {
        const comments = await prismaClient.comment.findMany();

        return comments;
    };

    public getCommentsOfPosts = async (postId: number) => {
        const comments = await prismaClient.comment.findMany({
            where: { postId },
        });

        return comments;
    };

    public getComment = async (id: number) => {
        const comment = await prismaClient.comment.findUnique({
            where: { id },
        });

        if (comment === null) {
            throw new HTTPNotFoundError('comment not found');
        }

        return comment;
    };

    public updateComment = async (
        id: number,
        { content }: Pick<Comment, 'content'>
    ) => {
        // only update comment when authorId matches userId from jwt, i.e only comment owner can update comment
        const updatedComment = await prismaClient.comment.update({
            where: { id, authorId: authContextStorage.getContext('userId') },
            data: { ...filterUndefinedValues({ content }) },
        });

        return updatedComment;
    };

    public deleteComment = async (id: number) => {
        const deletedComment = await prismaClient.comment.delete({
            where: { id, authorId: authContextStorage.getContext('userId') },
        });

        return deletedComment;
    };
}
