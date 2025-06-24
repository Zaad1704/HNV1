import React, { useState } from &quot;react&quot;;
import { Link, useNavigate } from &quot;react-router-dom&quot;;
import apiClient from &quot;../api/client&quot;; 
import { useAuthStore } from &quot;../store/authStore&quot;;
import { useSiteSettings } from &#39;../hooks/useSiteSettings&#39;;
import { Chrome } from &#39;lucide-react&#39;;

const RegisterPage: React.FC = () =\> {
const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [agreedToTerms, setAgreedToTerms] = useState(false);
const navigate = useNavigate();
const { setUser, setToken } = useAuthStore();
const { data: settings } = useSiteSettings();

const handleRoleSelect = (role: string) =\> {
setFormData({ ...formData, role });
};

const handleChange = (e: React.ChangeEvent&lt;HTMLInputElement&gt;) =\> {
setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleRegister = async (e: React.FormEvent) =\> {
e.preventDefault();
setLoading(true);
setError('');
if (\!formData.role) {
setError('Please select a role (Landlord or Agent).');
setLoading(false);
return;
}
if (\!agreedToTerms) {
setError('You must agree to the Terms and Conditions and Privacy Policy to create an account.');
setLoading(false);
return;
}
try {
const response = await apiClient.post('/auth/register', formData);
setToken(response.data.token);
setUser(response.data.user);
navigate('/dashboard');
} catch (err: any) {
setError(err.response?.data?.message || 'Registration failed. Please try again.');
} finally {
setLoading(false);
}
};

const handleGoogleSignup = () =\> {
window.location.href = `${import.meta.env.VITE_API_URL || ''}/auth/google`;
};

const roleCardClasses = "role-card p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center";
const selectedRoleClasses = "border-brand-primary ring-2 ring-brand-primary/50 shadow-md bg-indigo-50";

return (
&lt;div className=&quot;min-h-screen bg-brand-bg flex items-center justify-center p-4&quot;&gt;
&lt;div className=&quot;w-full max-w-4xl bg-light-card grid md:grid-cols-2 shadow-xl rounded-2xl overflow-hidden border border-border-color&quot;&gt;
&lt;div className=&quot;p-8 sm:p-12 order-2 md:order-1 flex flex-col justify-center&quot;&gt;
&lt;div className=&quot;mb-8&quot;&gt;
&lt;Link to=&quot;/&quot; className=&quot;inline-flex items-center gap-3&quot;&gt;
\<img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-10" /\>
&lt;span className=&quot;text-xl font-bold text-brand-dark&quot;&gt;{settings?.logos?.companyName || 'HNV Solutions'}&lt;/span&gt;
&lt;/Link&gt;
&lt;/div&gt;
&lt;h1 className=&quot;text-3xl font-bold mb-2&quot;&gt;Create Your Account&lt;/h1&gt;
&lt;p className=&quot;text-light-text mb-8&quot;&gt;Start your free trial today.&lt;/p&gt;
&lt;form onSubmit={handleRegister} className=&quot;space-y-6&quot;&gt;
{error && &lt;div className=&quot;bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm&quot;&gt;&lt;span&gt;{error}&lt;/span&gt;&lt;/div&gt;}
&lt;div&gt;
&lt;label className=&quot;block text-sm font-medium text-light-text mb-2&quot;&gt;First, choose your role&lt;/label&gt;
&lt;div className=&quot;grid grid-cols-1 sm:grid-cols-2 gap-4&quot;&gt;
\<div onClick={() =\> handleRoleSelect('Landlord')} className={`${roleCardClasses} ${formData.role === 'Landlord' ? selectedRoleClasses : 'border-border-color bg-brand-bg hover:bg-gray-100'}`}\>&lt;h3 className=&quot;font-bold text-base&quot;&gt;I am a Landlord&lt;/h3&gt;&lt;/div&gt;
\<div onClick={() =\> handleRoleSelect('Agent')} className={`${roleCardClasses} ${formData.role === 'Agent' ? selectedRoleClasses : 'border-border-color bg-brand-bg hover:bg-gray-100'}`}\>&lt;h3 className=&quot;font-bold text-base&quot;&gt;I am an Agent&lt;/h3&gt;&lt;/div&gt;
&lt;/div&gt;
&lt;/div&gt;
&lt;div&gt;
&lt;label htmlFor=&quot;name&quot; className=&quot;block text-sm font-medium text-light-text&quot;&gt;Full Name&lt;/label&gt;
&lt;input type=&quot;text&quot; name=&quot;name&quot; id=&quot;name&quot; required onChange={handleChange} className=&quot;mt-1 block w-full px-4 py-3 bg-brand-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none&quot; /&gt;
&lt;/div&gt;
&lt;div&gt;
&lt;label htmlFor=&quot;email&quot; className=&quot;block text-sm font-medium text-light-text&quot;&gt;Email Address&lt;/label&gt;
&lt;input type=&quot;email&quot; name=&quot;email&quot; id=&quot;email&quot; required onChange={handleChange} className=&quot;mt-1 block w-full px-4 py-3 bg-brand-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none&quot; /&gt;
&lt;/div&gt;
&lt;div&gt;
\<label htmlFor="password"className="block text-sm font-medium text-light-text"\>Create Password&lt;/label&gt;
&lt;input type=&quot;password&quot; name=&quot;password&quot; id=&quot;password&quot; required onChange={handleChange} className=&quot;mt-1 block w-full px-4 py-3 bg-brand-bg border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none&quot; /&gt;
&lt;/div&gt;

        <div className="flex items-start space-x-3">
            <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 mt-1 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <div className="text-sm">
                <label htmlFor="terms" className="font-medium text-light-text">
                    I agree to the 
                    <Link to="/terms" target="_blank" className="text-brand-primary hover:underline"> Terms and Conditions</Link> and 
                    <Link to="/privacy" target="_blank" className="text-brand-primary hover:underline"> Privacy Policy</Link>.
                </label>
            </div>
        </div>
        
        <div>
            <button type="submit" disabled={loading || !agreedToTerms} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating Account...' : 'Create Account'}
            </button>
        </div>
    </form>

    <div className="relative flex items-center justify-center py-4">
        <div className="flex-grow border-t border-border-color"></div>
        <span className="flex-shrink mx-4 text-light-text text-sm">OR</span>
        <div className="flex-grow border-t border-border-color"></div>
    </div>
    <button onClick={handleGoogleSignup} className="w-full flex justify-center items-center gap-2 py-3 border border-border-color rounded-lg shadow-sm font-semibold text-dark-text bg-white hover:bg-gray-100 transition-colors">
        <Chrome size={20} /> Sign Up with Google
    </button>
</div>

<div className="hidden md:flex flex-col justify-center p-12 order-1 md:order-2" style={{ background: 'linear-gradient(165deg, #3D52A0, #7091E6)'}}>
    <h2 className="text-3xl font-bold text-white mb-4">A smarter way to manage properties.</h2>
    <p className="text-indigo-200 mb-6">Our platform provides the tools, security, and support you need to grow your business.</p>
    <div className="mt-4 border-t border-white/20 pt-6">
        <p className="text-sm text-indigo-100">Already have an account?</p>
        <Link to="/login" className="font-bold text-white hover:underline">Sign In Here</Link>
    </div>
</div>
</div>
</div>


);
};

export default RegisterPage;
