import { promises as fs } from 'fs';
import path from 'path';

export const saveFile = async (file: File, directory: string): Promise<string> => {
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name}`;
        const filepath = path.join(process.cwd(), 'public', directory, filename);
        
        await fs.writeFile(filepath, buffer);
        return `/public/${directory}/${filename}`;
    } catch (error) {
        console.error('Error saving file:', error);
        throw new Error('Failed to save file');
    }
};

export const deleteFile = async (filepath: string): Promise<void> => {
    try {
        const fullPath = path.join(process.cwd(), filepath.replace(/^\//, ''));
        await fs.unlink(fullPath);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file');
    }
};

export const listFiles = async (directory: string): Promise<string[]> => {
    try {
        const dirPath = path.join(process.cwd(), 'public', directory);
        const files = await fs.readdir(dirPath);
        return files.map(file => `/public/${directory}/${file}`);
    } catch (error) {
        console.error('Error listing files:', error);
        throw new Error('Failed to list files');
    }
}; 