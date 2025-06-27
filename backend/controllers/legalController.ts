import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { marked } from 'marked';

// Get Terms of Service
export const getTermsOfService = asyncHandler(async (req: Request, res: Response) => {
  const termsMarkdown = `
# Terms of Service

## 1. Acceptance of Terms
By accessing and using HNV Property Management platform, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License
Permission is granted to temporarily download one copy of HNV platform materials for personal, non-commercial transitory viewing only.

## 3. Disclaimer
The materials on HNV platform are provided on an 'as is' basis. HNV makes no warranties, expressed or implied.

## 4. Limitations
In no event shall HNV be liable for any damages arising out of the use or inability to use the materials on HNV platform.

## 5. Accuracy of Materials
The materials appearing on HNV platform could include technical, typographical, or photographic errors.

## 6. Links
HNV has not reviewed all of the sites linked to our platform and is not responsible for the contents of any such linked site.

## 7. Modifications
HNV may revise these terms of service at any time without notice.

## 8. Governing Law
These terms and conditions are governed by and construed in accordance with applicable laws.

Last updated: ${new Date().toLocaleDateString()}
  `;

  const htmlContent = marked(termsMarkdown);
  
  res.json({
    success: true,
    data: {
      content: htmlContent,
      lastUpdated: new Date().toISOString()
    }
  });
});

// Get Privacy Policy
export const getPrivacyPolicy = asyncHandler(async (req: Request, res: Response) => {
  const privacyMarkdown = `
# Privacy Policy

## Information We Collect
We collect information you provide directly to us, such as when you create an account, use our services, or contact us.

## How We Use Your Information
We use the information we collect to provide, maintain, and improve our services.

## Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.

## Data Security
We implement appropriate security measures to protect your personal information.

## Your Rights
You have the right to access, update, or delete your personal information.

## Contact Us
If you have questions about this Privacy Policy, please contact us.

Last updated: ${new Date().toLocaleDateString()}
  `;

  const htmlContent = marked(privacyMarkdown);
  
  res.json({
    success: true,
    data: {
      content: htmlContent,
      lastUpdated: new Date().toISOString()
    }
  });
});