import fs from 'fs/promises';
import path from 'path';

/**
 * Delete a single file
 */
export const deleteFile = async (filePath) => {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
};

/**
 * Delete multiple files
 */
export const deleteFiles = async (filePaths) => {
  const results = await Promise.allSettled(
    filePaths.map(filePath => deleteFile(filePath))
  );
  return results;
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Generate unique filename
 */
export const generateFileName = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = getFileExtension(originalName);
  return `${prefix}${timestamp}-${random}${ext}`;
};