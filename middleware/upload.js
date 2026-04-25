const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { projectId, stageId } = req.params;

        // ✅ Safety check — fail early with a clear error
        if (!projectId || !stageId) {
            return cb(new Error('projectId and stageId are required in URL params'));
        }

        const uploadDir = path.join(__dirname, '..', 'uploads', 'projects', projectId, 'stages', stageId);
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname
            .replace(/,/g, '')
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, uniqueSuffix + '-' + sanitizedName);
    }
});

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 10 * 1024 * 1024 } 
});

module.exports = upload;