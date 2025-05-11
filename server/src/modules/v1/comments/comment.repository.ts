import { Comment } from '#src/generated/prisma';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';

export default class CommentRepository {
    public createComment = async (
        data: Pick<Comment, 'content' | 'authorId' | 'postId'>
    ) => {
        const comment = await prismaClient.comment.create({
            data,
        });

        return comment;
    };

    public findCommentById = async (id: number) => {
        const comment = await prismaClient.comment.findUnique({
            where: { id },
        });

        return comment;
    };

    public findComments = async () => {
        const comments = await prismaClient.comment.findMany();

        return comments;
    };

    public findCommentsByPostId = async (postId: number) => {
        const comments = await prismaClient.comment.findMany({
            where: { postId },
        });

        return comments;
    };

    public updateComment = async (
        id: number,
        authorId: number,
        data: Partial<Comment>
    ) => {
        const comment = await prismaClient.comment.update({
            where: { id, authorId },
            data,
        });

        return comment;
    };

    public deleteComment = async (id: number, authorId: number) => {
        const comment = await prismaClient.comment.delete({
            where: { id, authorId },
        });

        return comment;
    };
}
