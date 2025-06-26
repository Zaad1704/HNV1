// backend/controllers/legalController.ts
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import asyncHandler from 'express-async-handler';
import { marked } from 'marked';

const getLegalContentAsHtml = async (fileName: string) => {
    // Assuming the text files are in the project root. Adjust path if necessary.
    const filePath = path.join(__dirname, `../../../${fileName}`);
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return marked.parse(content); // Convert markdown-like text to HTML
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        throw new Error('Legal document not found.');
    }
};

export const getPrivacyPolicy = asyncHandler(async (req: Request, res: Response) => {
    const htmlContent = await getLegalContentAsHtml('HNV SaaS - Privacy Policy.txt');
    res.status(200).json({ success: true, content: htmlContent });
});

export const getTermsAndConditions = asyncHandler(async (req: Request, res: Response) => {
    const htmlContent = await getLegalContentAsHtml('HNV SaaS - Terms and Conditions.txt');
    res.status(200).json({ success: true, content: htmlContent });
});
