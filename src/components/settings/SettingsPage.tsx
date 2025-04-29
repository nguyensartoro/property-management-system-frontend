import React from 'react';
import { User, Settings, Copy, Plus, Pencil, Trash2, Phone, Mail, Check, AlertCircle, Save, Camera, X } from 'lucide-react';
import { toast } from '../ui/toast';
import { NavLink } from 'react-router-dom';
import Modal from '../shared/Modal';
import { QRCodeSVG } from 'qrcode.react';

const fontSizes = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' }
];

const fontFamilies = [
  { label: 'Inter', value: 'inter' },
  { label: 'Roboto', value: 'roboto' },
  { label: 'Open Sans', value: 'open-sans' }
];

const colorSchemes = [
  {
    label: 'Default',
    value: 'default',
    colors: ['#9b87f5', '#7E69AB', '#1A1F2C']
  },
  {
    label: 'Ocean',
    value: 'ocean',
    colors: ['#3B82F6', '#1D4ED8', '#1E3A8A']
  },
  {
    label: 'Forest',
    value: 'forest',
    colors: ['#10B981', '#059669', '#064E3B']
  }
];

const initialPaymentMethods = [
  { id: 1, type: 'Momo', value: 'momo', url: 'momo://pay?phone=0123456789&amount=0' },
  { id: 2, type: 'ZaloPay', value: 'zalopay', url: 'zalopay://pay?phone=0123456789&amount=0' },
  { id: 3, type: 'Bank Transfer', value: 'bank', accountNumber: '123456789', accountName: 'John Doe', bankName: 'HSBC' },
  { id: 4, type: 'Momo', value: 'momo2', url: 'momo://pay?phone=9876543210&amount=0' },
];

const paymentMethodTypes = [
  { id: 'momo', name: 'Momo', icon: <span className="w-5 h-5 text-pink-500">💸</span> },
  { id: 'zalopay', name: 'ZaloPay', icon: <span className="w-5 h-5 text-blue-500">💳</span> },
  { id: 'bank', name: 'Bank Transfer', icon: <span className="w-5 h-5 text-green-500">🏦</span> }
];

// Define theme class mappings
const fontSizeClasses = {
  small: 'text-sm', // 0.875rem
  medium: 'text-base', // 1rem
  large: 'text-lg', // 1.125rem
};

const fontFamilyClasses = {
  inter: 'font-inter',
  roboto: 'font-roboto',
  'open-sans': 'font-opensans',
};

// Color scheme class names
const colorSchemeClasses = {
  default: 'theme-default',
  ocean: 'theme-ocean',
  forest: 'theme-forest',
};

const paymentMethodIcons: { [key: string]: React.ReactNode } = {
  'Momo': <span className="w-5 h-5 text-pink-500">💸</span>,
  'ZaloPay': <span className="w-5 h-5 text-blue-500">💳</span>,
  'Bank Transfer': <span className="w-5 h-5 text-green-500">🏦</span>
};

const SettingsPage: React.FC = () => {
  // Get stored preferences from localStorage or use defaults
  const getStoredPreference = (key: string, defaultValue: string) => {
    const storedValue = localStorage.getItem(`theme_${key}`);
    return storedValue || defaultValue;
  };

  const [selectedFontSize, setSelectedFontSize] = React.useState(getStoredPreference('fontSize', 'medium'));
  const [selectedFontFamily, setSelectedFontFamily] = React.useState(getStoredPreference('fontFamily', 'inter'));
  const [selectedColorScheme, setSelectedColorScheme] = React.useState(getStoredPreference('colorScheme', 'default'));
  const [isDarkMode, setIsDarkMode] = React.useState(localStorage.getItem('theme_darkMode') === 'true');
  const [activeTab, setActiveTab] = React.useState('account');
  const [activeSystemSubtab, setActiveSystemSubtab] = React.useState('preferences');
  const [showAddPaymentModal, setShowAddPaymentModal] = React.useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = React.useState({
    type: 'momo',
    url: '',
    accountNumber: '',
    accountName: '',
    bankName: ''
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [userInfo, setUserInfo] = React.useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890'
  });
  const [copyStatus, setCopyStatus] = React.useState<Record<string, boolean>>({});
  const [showSaveSettingsSuccess, setShowSaveSettingsSuccess] = React.useState(false);

  // Password change state
  const [passwordValues, setPasswordValues] = React.useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordErrors, setPasswordErrors] = React.useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordRequirements, setPasswordRequirements] = React.useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  // Avatar state
  const [avatarSrc] = React.useState<string>('https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=300');

  const [paymentMethods, setPaymentMethods] = React.useState(initialPaymentMethods);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        // setTempAvatarSrc(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Apply initial theme settings on component mount
  React.useEffect(() => {
    applyThemeSettings();
  }, []);

  // Function to create and inject style element for theme
  const createOrUpdateStyleElement = (id: string, css: string) => {
    let styleElement = document.getElementById(id) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = id;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  };

  // Function to apply theme settings globally
  const applyThemeSettings = () => {
    // 1. Apply font size to the document
    document.documentElement.classList.remove(...Object.values(fontSizeClasses));
    document.documentElement.classList.add(fontSizeClasses[selectedFontSize as keyof typeof fontSizeClasses] || fontSizeClasses.medium);

    // 2. Apply font family to the document
    document.documentElement.classList.remove(...Object.values(fontFamilyClasses));
    document.documentElement.classList.add(fontFamilyClasses[selectedFontFamily as keyof typeof fontFamilyClasses] || fontFamilyClasses.inter);

    // Apply font family directly
    const fontFamilyMap: Record<string, string> = {
      'inter': "'Inter', sans-serif",
      'roboto': "'Roboto', sans-serif",
      'open-sans': "'Open Sans', sans-serif"
    };
    document.documentElement.style.fontFamily = fontFamilyMap[selectedFontFamily] || fontFamilyMap['inter'];

    // 3. Apply color scheme
    document.documentElement.classList.remove(...Object.values(colorSchemeClasses));
    document.documentElement.classList.add(colorSchemeClasses[selectedColorScheme as keyof typeof colorSchemeClasses] || colorSchemeClasses.default);

    // 4. Generate dynamic CSS for the theme
    generateThemeCSS();

    // 5. Apply dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // 6. Apply color scheme variables directly to root
    const colors = colorSchemes.find(scheme => scheme.value === selectedColorScheme)?.colors || colorSchemes[0].colors;

    // Set CSS variables directly on root element for immediate effect
    document.documentElement.style.setProperty('--primary-500', colors[0]);
    document.documentElement.style.setProperty('--primary-600', colors[1]);
    document.documentElement.style.setProperty('--secondary-900', colors[2]);
  };

  // Effect to apply theme settings when any theme option changes
  React.useEffect(() => {
    applyThemeSettings();
  }, [selectedFontSize, selectedFontFamily, selectedColorScheme, isDarkMode]);

  // Generate CSS for each theme (could be moved to a separate CSS file)
  const generateThemeCSS = () => {
    // Default theme
    const defaultCSS = `
      .theme-default {
        --primary-50: #f5f3ff;
        --primary-100: #ede9fe;
        --primary-200: #ddd6fe;
        --primary-300: #c4b5fd;
        --primary-400: #a78bfa;
        --primary-500: #9b87f5;
        --primary-600: #7E69AB;
        --primary-700: #6d4fac;
        --primary-800: #5a3a95;
        --primary-900: #4a2c79;
        --secondary-900: #1A1F2C;
      }
    `;

    // Ocean theme
    const oceanCSS = `
      .theme-ocean {
        --primary-50: #eff6ff;
        --primary-100: #dbeafe;
        --primary-200: #bfdbfe;
        --primary-300: #93c5fd;
        --primary-400: #60a5fa;
        --primary-500: #3B82F6;
        --primary-600: #1D4ED8;
        --primary-700: #1e40af;
        --primary-800: #1e3a8a;
        --primary-900: #1E3A8A;
        --secondary-900: #111827;
      }
    `;

    // Forest theme
    const forestCSS = `
      .theme-forest {
        --primary-50: #ecfdf5;
        --primary-100: #d1fae5;
        --primary-200: #a7f3d0;
        --primary-300: #6ee7b7;
        --primary-400: #34d399;
        --primary-500: #10B981;
        --primary-600: #059669;
        --primary-700: #047857;
        --primary-800: #065f46;
        --primary-900: #064E3B;
        --secondary-900: #064e3b;
      }
    `;

    // Font family CSS
    const fontFamilyCSS = `
      .font-inter {
        font-family: 'Inter', sans-serif;
      }
      .font-roboto {
        font-family: 'Roboto', sans-serif;
      }
      .font-opensans {
        font-family: 'Open Sans', sans-serif;
      }
    `;

    // Font size CSS
    const fontSizeCSS = `
      html.text-sm {
        font-size: 0.875rem;
      }
      html.text-base {
        font-size: 1rem;
      }
      html.text-lg {
        font-size: 1.125rem;
      }
    `;

    // Combine all CSS
    const allCSS = `
      ${defaultCSS}
      ${oceanCSS}
      ${forestCSS}
      ${fontFamilyCSS}
      ${fontSizeCSS}
    `;

    // Create or update style element
    createOrUpdateStyleElement('theme-styles', allCSS);
  };

  // Save theme settings to localStorage
  const saveThemeSettings = () => {
    localStorage.setItem('theme_fontSize', selectedFontSize);
    localStorage.setItem('theme_fontFamily', selectedFontFamily);
    localStorage.setItem('theme_colorScheme', selectedColorScheme);
    localStorage.setItem('theme_darkMode', isDarkMode.toString());

    // Apply the settings
    applyThemeSettings();

    // Show success message
    setShowSaveSettingsSuccess(true);
    setTimeout(() => {
      setShowSaveSettingsSuccess(false);
    }, 3000);

    // Show toast notification
    toast.success("Settings Saved", {
      description: "Your theme preferences have been applied globally"
    });
  };

  const handleFontSizeChange = (size: string) => {
    setSelectedFontSize(size);
  };

  const handleFontFamilyChange = (family: string) => {
    setSelectedFontFamily(family);
  };

  const handleColorSchemeChange = (scheme: string) => {
    setSelectedColorScheme(scheme);
  };

  const handleDarkModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDarkMode(e.target.checked);
  };

  const handleCopyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url);

    // Set copy status to true for this specific payment method
    setCopyStatus({...copyStatus, [id]: true});

    // Reset back to copy icon after 3 seconds
    setTimeout(() => {
      setCopyStatus({...copyStatus, [id]: false});
    }, 3000);
  };

  // New function to copy bank details
  const handleCopyBankDetails = (method: typeof paymentMethods[number], id: number) => {
    const bankDetailsText = `${method.bankName}\n${method.accountNumber}\n${method.accountName}`;
    navigator.clipboard.writeText(bankDetailsText);

    // Set copy status to true for this specific payment method
    setCopyStatus({...copyStatus, [id]: true});

    // Reset back to copy icon after 3 seconds
    setTimeout(() => {
      setCopyStatus({...copyStatus, [id]: false});
    }, 3000);

    // Show toast notification
    toast.success("Copied to clipboard", {
      description: "Bank details copied to clipboard"
    });
  };

  const handleRemovePaymentClick = () => {};

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update password values
    setPasswordValues({
      ...passwordValues,
      [name]: value
    });

    // Validate new password requirements
    if (name === 'new') {
      const requirements = {
        minLength: value.length >= 8,
        hasUppercase: /[A-Z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      };

      setPasswordRequirements(requirements);
    }

    // Clear any errors for the field being typed in
    setPasswordErrors({
      ...passwordErrors,
      [name]: ''
    });
  };

  const validatePassword = () => {
    let isValid = true;
    const errors = {
      current: '',
      new: '',
      confirm: ''
    };

    // Validate current password
    if (!passwordValues.current) {
      errors.current = 'Current password is required';
      isValid = false;
    }

    // Validate new password
    if (!passwordValues.new) {
      errors.new = 'New password is required';
      isValid = false;
    } else if (!passwordRequirements.minLength) {
      errors.new = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!passwordRequirements.hasUppercase) {
      errors.new = 'Password must contain at least one uppercase letter';
      isValid = false;
    } else if (!passwordRequirements.hasNumber) {
      errors.new = 'Password must contain at least one number';
      isValid = false;
    } else if (!passwordRequirements.hasSpecial) {
      errors.new = 'Password must contain at least one special character';
      isValid = false;
    }

    // Validate confirm password
    if (passwordValues.new !== passwordValues.confirm) {
      errors.confirm = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (validatePassword()) {
      console.log('Password changed successfully');
      // Here you would call the API to change the password
    }
  };

  // Add Payment Method Modal
  const handleAddPaymentMethod = () => {
    setShowAddPaymentModal(true);
  };

  const handleAddPaymentSubmit = () => {
    if (newPaymentMethod.type) {
      setPaymentMethods([...paymentMethods, {
        id: Date.now().toString(),
        type: newPaymentMethod.type,
        details: newPaymentMethod.details || {}
      }]);
      toast.success('Payment method added successfully!');
      setShowAddPaymentModal(false);
      setNewPaymentMethod({ type: '', details: {} });
    } else {
      toast.error('Please select a payment method type');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">Settings</h2>
        <p className="text-secondary-500">Manage your account and property settings</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="overflow-hidden pt-0 lg:col-span-1 dashboard-card">
          <div className="flex justify-center p-6 border-b bg-primary-50 border-primary-100">
            <div className="relative">
              <div className="overflow-hidden w-32 h-32 rounded-full">
                <img
                  src={avatarSrc}
                  alt="User profile"
                  className="object-cover w-full h-full"
                />
              </div>
              <label className="absolute right-0 bottom-0 p-2 text-white rounded-full transition-colors cursor-pointer bg-primary-600 hover:bg-primary-700">
                <Camera size={18} />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>

          <div className="p-4 text-center border-b border-gray-200">
            <div className="flex gap-2 justify-center items-center">
              <h3 className="text-lg font-semibold text-secondary-900">{userInfo.name}</h3>
              <button
                onClick={() => {
                  const newName = prompt('Enter new name:', userInfo.name);
                  if (newName && newName.trim() !== '') {
                    setUserInfo({...userInfo, name: newName});
                  }
                }}
                className="text-secondary-400 hover:text-secondary-600"
                title="Edit name"
              >
                <Pencil size={16} />
              </button>
            </div>
            <div className="flex gap-2 justify-center items-center mt-1">
              <p className="text-sm text-secondary-500">Premium Plan</p>
              <NavLink to="/plans" className="text-sm font-medium text-primary-500 hover:text-primary-600">
                View plan
              </NavLink>
            </div>
          </div>

          <div className="flex flex-col">
            <button
              className={`flex items-center gap-3 p-4 hover:bg-primary-50 transition-colors text-left ${activeTab === 'account' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-secondary-700'}`}
              onClick={() => setActiveTab('account')}
            >
              <User size={20} />
              <span>Account</span>
            </button>

            <button
              className={`flex items-center gap-3 p-4 hover:bg-primary-50 transition-colors text-left ${activeTab === 'system' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-secondary-700'}`}
              onClick={() => setActiveTab('system')}
            >
              <Settings size={20} />
              <span>System</span>
            </button>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-3">
          {activeTab === 'account' && (
            <>
              <div className="dashboard-card">
                <h3 className="mb-6 text-lg font-semibold text-secondary-900">Account Information</h3>

                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-secondary-500">
                      <div className="flex gap-2 items-center">
                        <Phone size={16} />
                        <span>Phone Number</span>
                      </div>
                    </label>
                    <input
                      type="tel"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                      className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-secondary-500">
                      <div className="flex gap-2 items-center">
                        <Mail size={16} />
                        <span>Email Address</span>
                      </div>
                    </label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                      className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-md text-secondary-900">Payment Methods</h4>
                    <button
                      onClick={handleAddPaymentMethod}
                      className="flex gap-1 items-center px-3 py-1 text-sm font-medium rounded-md transition-colors bg-primary-50 text-primary-600 hover:bg-primary-100"
                    >
                      <Plus size={16} />
                      <span>Add Method</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {paymentMethods.map((method: typeof paymentMethods[0]) => (
                      <div key={method.id} className="p-4 space-y-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2 items-center">
                            {paymentMethodIcons[method.type] ?? null}
                            <h5 className="font-medium text-secondary-900">{method.type}</h5>
                          </div>
                          <div className="flex gap-2">
                            {method.url && (
                              <button
                                onClick={() => handleCopyUrl(method.url, method.id)}
                                className={`transition-colors ${copyStatus[method.id] ? 'text-green-500' : 'text-secondary-400 hover:text-secondary-600'}`}
                                title={copyStatus[method.id] ? "Copied!" : "Copy URL"}
                              >
                                {copyStatus[method.id] ? <Check size={16} /> : <Copy size={16} />}
                              </button>
                            )}
                            {method.type === 'Bank Transfer' && (
                              <button
                                onClick={() => handleCopyBankDetails(method, method.id)}
                                className="text-secondary-400 hover:text-secondary-600"
                                title="Copy bank details"
                              >
                                <Copy size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemovePaymentClick()}
                              className="text-red-500 hover:text-red-700"
                              title="Remove method"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {method.url ? (
                          <>
                            <div className="flex justify-center p-2 bg-gray-50 rounded">
                              <QRCodeSVG
                                value={method.url}
                                size={100}
                                level="H"
                              />
                            </div>
                            <div className="text-xs text-center text-secondary-500">
                              <p>ID: {method.id}</p>
                              <p className="font-medium">{method.value}</p>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-1 text-sm text-secondary-700">
                            <p><span className="text-secondary-500">Bank:</span> {method.bankName}</p>
                            <p><span className="text-secondary-500">Number:</span> {method.accountNumber}</p>
                            <p><span className="text-secondary-500">Name:</span> {method.accountName}</p>
                            <p className="mt-2 text-xs text-secondary-500">ID: {method.id}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="mb-4 font-medium text-md text-secondary-900">Change Password</h4>

                  <form onSubmit={handleChangePassword}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-secondary-500">
                          Current Password
                        </label>
                        <input
                          name="current"
                          type="password"
                          value={passwordValues.current}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-2 border ${passwordErrors.current ? 'border-red-300 ring-red-100' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent`}
                        />
                        {passwordErrors.current && (
                          <p className="flex gap-1 items-center mt-1 text-xs text-red-500">
                            <AlertCircle size={12} />
                            {passwordErrors.current}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-secondary-500">
                          New Password
                        </label>
                        <input
                          name="new"
                          type="password"
                          value={passwordValues.new}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-2 border ${passwordErrors.new ? 'border-red-300 ring-red-100' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent`}
                        />
                        {passwordErrors.new && (
                          <p className="flex gap-1 items-center mt-1 text-xs text-red-500">
                            <AlertCircle size={12} />
                            {passwordErrors.new}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-secondary-500">
                          Confirm New Password
                        </label>
                        <input
                          name="confirm"
                          type="password"
                          value={passwordValues.confirm}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-2 border ${passwordErrors.confirm ? 'border-red-300 ring-red-100' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent`}
                        />
                        {passwordErrors.confirm && (
                          <p className="flex gap-1 items-center mt-1 text-xs text-red-500">
                            <AlertCircle size={12} />
                            {passwordErrors.confirm}
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="mb-1 text-sm font-medium opacity-0"></span>
                        <button
                          type="submit"
                          className="px-4 py-2 w-full text-white rounded-md bg-primary-600 hover:bg-primary-700"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-secondary-500">
                        Password Requirements
                      </label>
                      <ul className="mt-4 space-y-3 text-sm text-secondary-500">
                        <li className="flex gap-2 items-center">
                          {passwordRequirements.minLength
                            ? <Check size={16} className="text-green-500" />
                            : <X size={16} className="text-gray-400" />
                          }
                          <span className={passwordRequirements.minLength ? 'text-green-600' : ''}>
                            Minimum 8 characters
                          </span>
                        </li>
                        <li className="flex gap-2 items-center">
                          {passwordRequirements.hasUppercase
                            ? <Check size={16} className="text-green-500" />
                            : <X size={16} className="text-gray-400" />
                          }
                          <span className={passwordRequirements.hasUppercase ? 'text-green-600' : ''}>
                            At least one uppercase letter
                          </span>
                        </li>
                        <li className="flex gap-2 items-center">
                          {passwordRequirements.hasNumber
                            ? <Check size={16} className="text-green-500" />
                            : <X size={16} className="text-gray-400" />
                          }
                          <span className={passwordRequirements.hasNumber ? 'text-green-600' : ''}>
                            At least one number
                          </span>
                        </li>
                        <li className="flex gap-2 items-center">
                          {passwordRequirements.hasSpecial
                            ? <Check size={16} className="text-green-500" />
                            : <X size={16} className="text-gray-400" />
                          }
                          <span className={passwordRequirements.hasSpecial ? 'text-green-600' : ''}>
                            At least one special character
                          </span>
                        </li>
                      </ul>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}

          {activeTab === 'system' && (
            <div className="dashboard-card">
              <div className="pb-4 mb-6 border-b border-gray-200">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveSystemSubtab('preferences')}
                    className={`pb-4 text-sm font-medium border-b-2 ${
                      activeSystemSubtab === 'preferences'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700'
                    }`}
                  >
                    System Preferences
                  </button>
                </div>
              </div>

              {activeSystemSubtab === 'preferences' && (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-secondary-700">
                        Font Size
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {fontSizes.map(size => (
                          <button
                            key={size.value}
                            onClick={() => handleFontSizeChange(size.value)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors
                              ${selectedFontSize === size.value
                                ? 'border-primary-400 bg-primary-50 text-primary-600'
                                : 'border-gray-200 hover:bg-gray-50 text-secondary-700'
                              }`}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-secondary-700">
                        Font Family
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {fontFamilies.map(font => (
                          <button
                            key={font.value}
                            onClick={() => handleFontFamilyChange(font.value)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors
                              ${selectedFontFamily === font.value
                                ? 'border-primary-400 bg-primary-50 text-primary-600'
                                : 'border-gray-200 hover:bg-gray-50 text-secondary-700'
                              }`}
                            style={{ fontFamily: font.value }}
                          >
                            {font.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-secondary-700">
                        Color Scheme
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {colorSchemes.map(scheme => (
                          <button
                            key={scheme.value}
                            onClick={() => handleColorSchemeChange(scheme.value)}
                            className={`p-3 rounded-lg border transition-colors flex flex-col items-center
                              ${selectedColorScheme === scheme.value
                                ? 'border-primary-400 bg-primary-50'
                                : 'border-gray-200'
                              }`}
                          >
                            <div className="flex gap-2 items-center mb-2">
                              {scheme.colors.map((color, index) => (
                                <div
                                  key={index}
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-secondary-700">
                              {scheme.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-secondary-700">
                        Dark Mode
                      </label>
                      <div className="p-3 rounded-lg border border-gray-200 h-[88px] flex items-center">
                        <div className="flex justify-between items-center w-full">
                          <div>
                            <h4 className="text-sm font-medium text-secondary-900">Dark Mode</h4>
                            <p className="text-xs text-secondary-500">Enable dark mode for the interface</p>
                          </div>
                          <label className="inline-flex relative items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isDarkMode}
                              onChange={handleDarkModeChange}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Theme Preview Section */}
                  <div className="p-6 mt-8 rounded-lg border border-gray-200">
                    <h3 className="mb-4 text-lg font-medium text-secondary-900">Theme Preview</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-secondary-700">Button Examples</h4>
                        <div className="flex flex-wrap gap-3">
                          <button className="px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700">
                            Primary Button
                          </button>
                          <button className="px-4 py-2 bg-white rounded-md border border-gray-300 hover:bg-gray-50 text-secondary-700">
                            Secondary Button
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 text-sm font-medium text-secondary-700">Typography</h4>
                        <div className="space-y-2">
                          <p className="font-bold text-secondary-900">Bold Text</p>
                          <p className="text-secondary-700">Regular Text</p>
                          <p className="text-secondary-500">Secondary Text</p>
                          <p className="text-primary-600">Primary Color Text</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 mt-6 border-t border-gray-200">
                    <button
                      onClick={saveThemeSettings}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                        showSaveSettingsSuccess
                          ? 'text-white bg-green-500'
                          : 'text-white bg-primary-600 hover:bg-primary-700'
                      }`}
                    >
                      {showSaveSettingsSuccess ? <Check size={18} /> : <Save size={18} />}
                      <span>{showSaveSettingsSuccess ? 'Saved!' : 'Apply Settings'}</span>
                    </button>
                  </div>

                  <div className="p-4 mt-6 text-sm text-blue-800 bg-blue-50 rounded-lg border border-blue-100">
                    <p>Changes to system preferences will be applied globally to the entire dashboard.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Method Modal */}
      <Modal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        title="Add Payment Method"
      >
        <div className="p-4">
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Payment Method Type
            </label>
            <select
              className="p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={newPaymentMethod.type}
              onChange={(e) => setNewPaymentMethod({...newPaymentMethod, type: e.target.value, details: {}})}
            >
              <option value="">Select payment method</option>
              {paymentMethodTypes.map(type => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {newPaymentMethod.type === 'Bank Transfer' && (
            <>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Bank Name
                </label>
                <input
                  type="text"
                  className="p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={newPaymentMethod.details?.bankName || ''}
                  onChange={(e) => setNewPaymentMethod({
                    ...newPaymentMethod,
                    details: {...newPaymentMethod.details, bankName: e.target.value}
                  })}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Account Number
                </label>
                <input
                  type="text"
                  className="p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={newPaymentMethod.details?.accountNumber || ''}
                  onChange={(e) => setNewPaymentMethod({
                    ...newPaymentMethod,
                    details: {...newPaymentMethod.details, accountNumber: e.target.value}
                  })}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Account Name
                </label>
                <input
                  type="text"
                  className="p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={newPaymentMethod.details?.accountName || ''}
                  onChange={(e) => setNewPaymentMethod({
                    ...newPaymentMethod,
                    details: {...newPaymentMethod.details, accountName: e.target.value}
                  })}
                />
              </div>
            </>
          )}

          {(newPaymentMethod.type === 'Momo' || newPaymentMethod.type === 'ZaloPay') && (
            <>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={newPaymentMethod.details?.phoneNumber || ''}
                  onChange={(e) => setNewPaymentMethod({
                    ...newPaymentMethod,
                    details: {...newPaymentMethod.details, phoneNumber: e.target.value}
                  })}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Account Name
                </label>
                <input
                  type="text"
                  className="p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={newPaymentMethod.details?.accountName || ''}
                  onChange={(e) => setNewPaymentMethod({
                    ...newPaymentMethod,
                    details: {...newPaymentMethod.details, accountName: e.target.value}
                  })}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end mt-6">
            <button
              onClick={() => setShowAddPaymentModal(false)}
              className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPaymentSubmit}
              className="px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700"
            >
              Add Payment Method
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;