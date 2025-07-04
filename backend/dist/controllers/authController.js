"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationEmail = exports.googleAuthCallback = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Plan_1 = __importDefault(require("../models/Plan"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const emailService_1 = __importDefault(require("../services/emailService"));
const crypto_1 = __importDefault(require("crypto"));
const sendTokenResponse = async (user, statusCode, res) => { const token = user.getSignedJwtToken(); };
const subscription = await Subscription_1.default.findOne({ organizationId: user.organizationId });
res.status(statusCode).json({ success: true,
    token,
    user: {},
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
}, userStatus, subscription?.status || 'inactive');
;
const generateOrgCode = () => { return Math.random().toString(36).substring(2, 8).toUpperCase(); };
;
const registerUser = async (req, res, next) => {
    const { name, email, password, role, organizationCode, isIndependentAgent } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
        if (role === 'Tenant' && !organizationCode) {
            return res.status(400).json({ success: false, message: 'Organization code is required for tenant signup' });
            try {
                const userExists = await User_1.default.findOne({ email });
                if (userExists) {
                    if (!userExists.isEmailVerified) { }
                    return res.status(400).json({ success: false, message: 'This email is already registered but not verified. Please check your inbox.' });
                    return res.status(400).json({ success: false, message: 'User with that email already exists' });
                    let organization;
                    let user;
                    if (role === 'Tenant' || (role === 'Agent' && organizationCode)) {
                        organization = await Organization_1.default.findOne({ organizationCode });
                        if (!organization) {
                            return res.status(400).json({ success: false, message: 'Invalid organization code' });
                            user = new User_1.default({ name,
                                email,
                                password,
                                role,
                                organizationId: organization._id,
                                isEmailVerified: false });
                        }
                        ;
                        organization.members.push(user._id);
                        await organization.save();
                    }
                    else {
                        const trialPlan = await Plan_1.default.findOne({ name: 'Free Trial' });
                        if (!trialPlan) {
                            return res.status(500).json({ success: false, message: 'Trial plan not configured. Please run setup.' });
                            let orgCode;
                            do {
                                orgCode = generateOrgCode();
                            } while ();
                        }
                        while (await Organization_1.default.findOne({ organizationCode: orgCode }))
                            ;
                        organization = new Organization_1.default({}, name, `${name}'s Organization`, organizationCode, orgCode, status, 'active');
                    }
                    ;
                    user = new User_1.default({ name,
                        email,
                        password,
                        role,
                        organizationId: organization._id,
                        isEmailVerified: false });
                }
                ;
                organization.owner = user._id;
                organization.members = [user._id];
                await organization.save();
                await Subscription_1.default.create({ organizationId: organization._id,
                    planId: trialPlan._id,
                    status: 'active' });
            }
            finally { }
            ;
            await user.save();
            const verificationToken = crypto_1.default.randomBytes(20).toString('hex');
            user.emailVerificationToken = verificationToken;
            user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await user.save();
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
            try {
                await emailService_1.default.sendEmail();
                user.email,
                    'Verify Your Email',
                    'emailVerification',
                    {};
                name: user.name,
                    verificationUrl, `

          dashboardUrl: `;
                $;
                {
                    process.env.FRONTEND_URL;
                }
                /dashboard`;
            }
            finally {
            }
        }
    }
};
exports.registerUser = registerUser;
;
try { }
catch (emailError) {
    console.error('Failed to send verification email:', emailError);
}
res.status(201).json({ success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    user: {},
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
});
try { }
catch (error) {
    console.error('Registration error:', error);
}
res.status(500).json({ success: false, message: 'Server error during registration' });
;
const googleAuthCallback = async (req, res) => {
    try { }
    finally {
    }
    if (!req.user) {
        ` }


      return res.redirect(`;
        $;
        {
            process.env.FRONTEND_URL || 'http://localhost:3000';
        }
        /login?error=google-auth-failed`);;
        const user = req.user;
        const token = user.getSignedJwtToken();
        `
    res.redirect(`;
        $;
        {
            process.env.FRONTEND_URL || 'http://localhost:3000';
        }
        /auth/google / callback ? token = $ : ;
        {
            token;
        }
        `);
  } catch (error) { `;
    }
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google-auth-failed`);
};
exports.googleAuthCallback = googleAuthCallback;
const resendVerificationEmail = async (req, res) => {
    try { }
    finally {
    }
    const { email } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
            const verificationToken = crypto_1.default.randomBytes(20).toString('hex');
            user.emailVerificationToken = verificationToken;
            user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await user.save();
            `
    const verificationUrl = `;
            $;
            {
                process.env.FRONTEND_URL || 'http://localhost:3000';
            }
            /verify-email/$;
            {
                verificationToken;
            }
            `;
    
    await emailService.sendEmail();
      user.email,
      'Verify Your Email',
      'emailVerification',
      { name: user.name,
        verificationUrl; }


    );
    
    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });

};`;
        }
    }
};
exports.resendVerificationEmail = resendVerificationEmail;
