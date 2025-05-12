import { Post } from '#src/generated/prisma';
import { type RequestHandler } from 'express';
import PostService from './post.service';

export interface IPostsQuery {
    search: string;
    page: string;
    limit: string;
    sortBy: string;
    sortOrder: string;
}

export default class PostController {
    private readonly postService = new PostService();

    public handleCreatePost: RequestHandler = async (req, res) => {
        const { title, content } = req.body as Post;
        const imageFilePath = req.file?.path;

        const newPost = await this.postService.createPost(
            {
                title,
                content,
            },
            imageFilePath
        );

        res.status(201).json({
            message: 'Created: post',
            post: newPost,
        });
    };

    public handleGetPost: RequestHandler = async (req, res) => {
        const { postId } = req.params;

        const post = await this.postService.getPost(Number(postId));

        res.status(200).json({ message: 'Fetched: post', post });
    };

    public handleGetPosts: RequestHandler = async (req, res) => {
        const { search, page, limit, sortBy, sortOrder }: Partial<IPostsQuery> =
            req.query;

        const posts = await this.postService.getPosts({
            search,
            page,
            limit,
            sortBy,
            sortOrder,
        });

        res.status(200).json({ message: 'Fetched: posts', posts });
    };

    public handleUpdatePost: RequestHandler = async (req, res) => {
        const { postId } = req.params;
        const { title, content } = req.body as Post;
        const imageFilePath = req.file?.path;

        const updatedPost = await this.postService.updatePost(
            Number(postId),
            {
                title,
                content,
            },
            imageFilePath
        );

        res.status(200).json({
            message: 'Updated: post',
            post: updatedPost,
        });
    };

    public handleDeletePost: RequestHandler = async (req, res) => {
        const { postId } = req.params;

        await this.postService.deletePost(Number(postId));

        res.sendStatus(204);
    };
}
