export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with that email already exists' });
    }
    const trialPlan = await Plan.findOne({ name: 'Free Trial' });
    if (!trialPlan) {
        return res.status(500).json({ success: false, message: 'Trial plan not configured. Please run setup.' });
    }
    const organization = new Organization({ name: `${name}'s Organization`, members: [] });
    const user = new User({ name, email, password, role, organizationId: organization._id });
    organization.owner = user._id as Types.ObjectId;
    organization.members.push(user._id as Types.ObjectId);
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const subscription = new Subscription({
        organizationId: organization._id as Types.ObjectId,
        planId: trialPlan._id as Types.ObjectId,
        status: 'trialing',
        trialExpiresAt: trialEndDate,
    });
    organization.subscription = subscription._id as Types.ObjectId;
    await organization.save();
    await user.save();
    await subscription.save();
    
    auditService.recordAction(
        user._id as Types.ObjectId,
        organization._id as Types.ObjectId,
        'USER_REGISTER',
        { registeredUserId: (user._id as Types.ObjectId).toString() }
    );
    
    // FIX: The 4th argument (the templateData object) is now correctly included.
    try {
        await emailService.sendEmail(
          user.email, 
          'Welcome to HNV Property Solutions!', 
          'welcome', 
          { // This is the 4th argument
            userName: user.name,
            loginUrl: 'https://hnv-1-frontend.onrender.com/login'
          }
        );
    } catch (emailError) {
        console.error("Failed to send welcome email, but user was registered successfully:", emailError);
    }

    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
