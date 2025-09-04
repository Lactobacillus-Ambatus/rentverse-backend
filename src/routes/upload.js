const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
} = require('../middleware/upload');
const uploadController = require('../utils/uploadController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             fileName:
 *               type: string
 *             originalName:
 *               type: string
 *             mimeType:
 *               type: string
 *             size:
 *               type: number
 *             url:
 *               type: string
 *             bucket:
 *               type: string
 */

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload management API
 */

/**
 * @swagger
 * /api/upload/single:
 *   post:
 *     summary: Upload a single file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 description: Folder to upload to (optional)
 *               optimize:
 *                 type: boolean
 *                 description: Whether to optimize images (default true)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/single',
  auth,
  uploadSingle('file'),
  uploadController.uploadSingle
);

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *                 description: Folder to upload to (optional)
 *               optimize:
 *                 type: boolean
 *                 description: Whether to optimize images (default true)
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/multiple',
  auth,
  uploadMultiple('files', 10),
  uploadController.uploadMultiple
);

/**
 * @swagger
 * /api/upload/property-images:
 *   post:
 *     summary: Upload property images with thumbnails
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Property images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     images:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FileUploadResponse'
 *                     thumbnails:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/property-images',
  auth,
  authorize('LANDLORD', 'ADMIN'),
  uploadMultiple('files', 10),
  uploadController.uploadPropertyImages
);

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       $ref: '#/components/schemas/FileUploadResponse'
 *                     thumbnail:
 *                       $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/avatar',
  auth,
  uploadSingle('file'),
  uploadController.uploadAvatar
);

/**
 * @swagger
 * /api/upload/delete/{fileName}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.delete('/delete/:fileName', auth, uploadController.deleteFile);

/**
 * @swagger
 * /api/upload/delete-multiple:
 *   delete:
 *     summary: Delete multiple files
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileNames:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Files deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.delete('/delete-multiple', auth, uploadController.deleteMultipleFiles);

// Error handling middleware
router.use(handleUploadError);

module.exports = router;
