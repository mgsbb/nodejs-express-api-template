import { Post } from '#src/generated/prisma';
import { type RequestHandler } from 'express';
import PostService from './post.service';

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
            message: 'post creation success',
            post: newPost,
        });
    };

    public handleGetPost: RequestHandler = async (req, res) => {
        const { postId } = req.params;

        const post = await this.postService.getPost(Number(postId));

        res.status(200).json({ message: 'fetch post success', post });
    };

    public handleGetPosts: RequestHandler = async (req, res) => {
        const posts = await this.postService.getPosts();

        res.status(200).json({ message: 'fetch posts success', posts });
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
            message: 'update post success',
            post: updatedPost,
        });
    };

    public handleDeletePost: RequestHandler = async (req, res) => {
        const { postId } = req.params;

        await this.postService.deletePost(Number(postId));

        res.sendStatus(204);
    };
}
