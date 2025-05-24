import fs from 'node:fs/promises';
import path from 'node:path';

async function copyYAML(src: string, dest: string) {
    const items = await fs.readdir(src);

    for (const item of items) {
        const srcPath = path.resolve(src, item);
        const destPath = path.resolve(dest, item);
        const stats = await fs.stat(srcPath);

        // recursively check all directories
        if (stats.isDirectory()) {
            await copyYAML(srcPath, destPath);
        }

        // check if filename ends with .yml or .yaml and copy it
        // check if filename ends with .node (prisma generated)
        if (/\.(ya?ml)$/.test(item) || /\.(node)$/.test(item)) {
            // console.log(srcPath, destPath);
            await fs.copyFile(srcPath, destPath);
        }
    }
}

//  IIFE - immediately invoked function expression
(async () => {
    const rootDir = process.cwd();
    const srcDir = path.resolve(rootDir, 'src');
    const destDir = path.resolve(rootDir, 'dist', 'src');
    try {
        await copyYAML(srcDir, destDir);
    } catch (error) {
        console.error(error);
    }
})();
