import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Palette, Upload, Loader2, Save, X, Image as ImageIcon,
  LayoutDashboard, Users, Settings as SettingsIcon, Bell
} from 'lucide-react';
import { motion } from 'framer-motion';

const BrandingSettings = () => {
  const { user, login } = useAuth();
  const { setBranding } = useTheme();

  const [primaryColor, setPrimaryColor] = useState(user?.branding?.primaryColor || '#111827');
  const [logoUrl, setLogoUrl] = useState(user?.branding?.logoUrl || '');
  const [loading, setLoading] = useState(false);

  // Modern Presets
  const presets = [
    '#111827', // Zinc (Default)
    '#2563eb', // Blue
    '#7c3aed', // Violet
    '#db2777', // Pink
    '#059669', // Emerald
    '#d97706', // Amber
    '#dc2626', // Red
    '#0891b2', // Cyan
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put('/user/branding', { logoUrl, primaryColor });

      // Update Contexts
      login({ ...user, branding: res.data.branding });
      setBranding(res.data.branding);

      alert('Branding updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update branding.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-10">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Palette className="text-gray-400" size={24} />
          Look & Feel
        </h2>
        <p className="text-gray-500 mt-1">Customize the dashboard to match your brand identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* --- LEFT COLUMN: CONTROLS --- */}
        <div className="space-y-8">

          {/* 1. Logo Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Company Logo</label>
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden relative group shrink-0">
                {logoUrl ? (
                  <>
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    <button
                      onClick={() => setLogoUrl('')}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="text-white" size={20} />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="text-gray-400" size={32} />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://your-website.com/logo.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Paste a direct link to your logo (PNG or SVG recommended). <br/>
                  Best size: 200x200px.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Color Picker */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Brand Color</label>

            <div className="flex items-center gap-4">
               {/* Native Picker Hidden behind a custom UI */}
               <div className="relative group cursor-pointer">
                 <div
                    className="w-16 h-16 rounded-xl shadow-inner border border-gray-200"
                    style={{ backgroundColor: primaryColor }}
                 />
                 <input
                   type="color"
                   value={primaryColor}
                   onChange={(e) => setPrimaryColor(e.target.value)}
                   className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                 />
                 <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                   <Palette size={14} className="text-gray-600" />
                 </div>
               </div>

               <div className="flex-1">
                 <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono text-sm border border-gray-300 rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                    maxLength={7}
                 />
               </div>
            </div>

            {/* Presets */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Presets</p>
              <div className="flex flex-wrap gap-3">
                {presets.map(color => (
                  <button
                    key={color}
                    onClick={() => setPrimaryColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === color ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: LIVE PREVIEW --- */}
        <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Preview</h4>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
          </div>

          {/* Mini App Mockup */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex h-80 relative">

            {/* Mock Sidebar */}
            <div className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-4">
              <div
                 className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
                 style={{ backgroundColor: primaryColor }}
              >
                 {/* Logo Placeholder */}
                 <div className="w-5 h-5 bg-white/20 rounded-md"></div>
              </div>

              <div className="flex-1 w-full px-2 space-y-2 mt-4">
                {/* Active Link */}
                <div
                  className="w-full aspect-square rounded-lg flex items-center justify-center bg-gray-50 transition-colors duration-300"
                  style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }} // 15 = low opacity hex
                >
                  <LayoutDashboard size={18} />
                </div>
                {/* Inactive Links */}
                <div className="w-full aspect-square rounded-lg flex items-center justify-center text-gray-400">
                  <Users size={18} />
                </div>
                <div className="w-full aspect-square rounded-lg flex items-center justify-center text-gray-400">
                  <SettingsIcon size={18} />
                </div>
              </div>
            </div>

            {/* Mock Content Area */}
            <div className="flex-1 flex flex-col">
               {/* Mock Header */}
               <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6">
                 <div className="w-24 h-4 bg-gray-200 rounded-full"></div>
                 <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                     <Bell size={14} />
                   </div>
                   <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                 </div>
               </div>

               {/* Mock Dashboard Body */}
               <div className="p-6 bg-gray-50 flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-32 h-6 bg-gray-200 rounded-md"></div>
                    <motion.div
                      className="px-4 py-2 rounded-lg text-white text-xs font-medium shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                      animate={{ backgroundColor: primaryColor }}
                    >
                      + Create New
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-24">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 mb-3 flex items-center justify-center" style={{ color: primaryColor }}>
                        <LayoutDashboard size={16} />
                      </div>
                      <div className="w-12 h-3 bg-gray-200 rounded mb-2"></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-24">
                       <div className="w-8 h-8 rounded-lg bg-gray-50 mb-3"></div>
                       <div className="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
               </div>
            </div>

          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-6 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 text-white px-8 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ backgroundColor: primaryColor }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span className="font-semibold">Save Branding</span>
        </button>
      </div>
    </div>
  );
};

export default BrandingSettings;
