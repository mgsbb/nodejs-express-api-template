import { HTTPBadRequestError } from '#src/utils/errors/http.error';
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

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
    // NOTE: image sent as bytes may have the mimetype as text/plain
    const allowedFileTypes = /jpeg|jpg|png|webp/;
    const fileMimeType = file.mimetype;
    const fileExtension = path.extname(file.originalname).toLowerCase();

    const isMimeTypeAllowed = allowedFileTypes.test(fileMimeType);
    const isExtensionAllowed = allowedFileTypes.test(fileExtension);

    if (!isExtensionAllowed || !isMimeTypeAllowed) {
        return cb(
            new HTTPBadRequestError(
                'invalid file, only images with jpg, jpeg, png, webp extension allowed'
            )
        );
    }

    // can also filter by file size

    return cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
});

export default upload;
