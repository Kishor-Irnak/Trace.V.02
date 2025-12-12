import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton } from '../components/ui/Glass';
import { UserProfile } from '../types';

interface SettingsProps {
  user?: UserProfile;
  onUpdateUser?: (user: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    avatar: '',
    plan: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'notifications', label: 'Notifications' },
  ];

  const handleSave = () => {
    if (onUpdateUser) {
      // Generate initials from new name
      const initials = formData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      const updatedUser = {
        ...formData,
        avatar: initials
      };
      
      onUpdateUser(updatedUser);
      // Optional: Add toast notification here
      alert("Profile updated successfully!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Account Settings</h2>
      
      <div className="flex gap-1 bg-slate-100 p-1 rounded-md mb-8 w-fit">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 text-xs font-medium rounded transition-all ${
                    activeTab === tab.id 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      <GlassCard className="p-8 min-h-[400px]">
        {activeTab === 'profile' && (
            <div className="space-y-6 max-w-lg">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-slate-500">
                        {formData.avatar}
                    </div>
                    <div>
                        <GlassButton variant="outline" className="text-xs">Upload New</GlassButton>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all" 
                        />
                    </div>
                </div>
                <div className="pt-6 border-t border-slate-100 mt-6">
                    <GlassButton variant="primary" onClick={handleSave}>Save Changes</GlassButton>
                </div>
            </div>
        )}
        {(activeTab === 'workspace' || activeTab === 'notifications') && (
             <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Configuration not available in demo.
            </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Settings;