import { formatDateISO } from '#src/utils/generic.util';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(
            null,
            formatDateISO(new Date().toISOString()) +
                path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage });

export default upload;
