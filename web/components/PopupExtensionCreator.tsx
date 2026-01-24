'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Check,
  Info,
  List,
  FileText,
  AlertTriangle,
  HelpCircle,
  Bell,
  Settings,
  Zap,
  Star,
  Heart,
  Bookmark,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Palette,
  Type,
  Layout,
  Save,
} from 'lucide-react';
import type { PopupExtensionCreatorProps, PopupExtension, PopupContentItem } from './types';

const ICON_OPTIONS = [
  { value: 'info', icon: Info, label: 'Info' },
  { value: 'list', icon: List, label: 'List' },
  { value: 'file', icon: FileText, label: 'Document' },
  { value: 'alert', icon: AlertTriangle, label: 'Alert' },
  { value: 'help', icon: HelpCircle, label: 'Help' },
  { value: 'bell', icon: Bell, label: 'Notification' },
  { value: 'settings', icon: Settings, label: 'Settings' },
  { value: 'zap', icon: Zap, label: 'Action' },
  { value: 'star', icon: Star, label: 'Star' },
  { value: 'heart', icon: Heart, label: 'Heart' },
  { value: 'bookmark', icon: Bookmark, label: 'Bookmark' },
  { value: 'message', icon: MessageSquare, label: 'Message' },
];

const COLOR_PRESETS = [
  { name: 'Primary', value: '#4CAF50', bg: 'bg-primary' },
  { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500' },
  { name: 'Purple', value: '#8B5CF6', bg: 'bg-purple-500' },
  { name: 'Orange', value: '#F97316', bg: 'bg-orange-500' },
  { name: 'Red', value: '#EF4444', bg: 'bg-red-500' },
  { name: 'Yellow', value: '#EAB308', bg: 'bg-yellow-500' },
  { name: 'Cyan', value: '#06B6D4', bg: 'bg-cyan-500' },
  { name: 'Pink', value: '#EC4899', bg: 'bg-pink-500' },
];

const SIZE_OPTIONS = [
  { value: 'sm', label: 'Small', width: 'max-w-sm' },
  { value: 'md', label: 'Medium', width: 'max-w-md' },
  { value: 'lg', label: 'Large', width: 'max-w-lg' },
  { value: 'xl', label: 'Extra Large', width: 'max-w-xl' },
  { value: 'full', label: 'Full Width', width: 'max-w-3xl' },
];

const CONTENT_TYPES = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'heading', label: 'Heading', icon: Type },
  { value: 'list', label: 'List', icon: List },
  { value: 'divider', label: 'Divider', icon: Layout },
  { value: 'button', label: 'Button', icon: Zap },
];

const generateId = () => `ext_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export default function PopupExtensionCreator({ isOpen, onClose, onSave, extensions, onDelete }: PopupExtensionCreatorProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [showPreview, setShowPreview] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('appearance');

  // Form state
  const [extensionName, setExtensionName] = useState('My Extension');
  const [extensionIcon, setExtensionIcon] = useState('info');
  const [extensionColor, setExtensionColor] = useState('#4CAF50');
  const [extensionSize, setExtensionSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');
  const [extensionTitle, setExtensionTitle] = useState('Extension Title');
  const [extensionSubtitle, setExtensionSubtitle] = useState('');
  const [contentItems, setContentItems] = useState<PopupContentItem[]>([
    { id: generateId(), type: 'text', content: 'Add your content here...' },
  ]);
  const [showCloseButton, setShowCloseButton] = useState(true);
  const [backdropClose, setBackdropClose] = useState(true);

  // Editing state
  const [editingExtension, setEditingExtension] = useState<PopupExtension | null>(null);

  // Reset form
  const resetForm = useCallback(() => {
    setExtensionName('My Extension');
    setExtensionIcon('info');
    setExtensionColor('#4CAF50');
    setExtensionSize('md');
    setExtensionTitle('Extension Title');
    setExtensionSubtitle('');
    setContentItems([{ id: generateId(), type: 'text', content: 'Add your content here...' }]);
    setShowCloseButton(true);
    setBackdropClose(true);
    setEditingExtension(null);
  }, []);

  // Load extension for editing
  const loadExtension = useCallback((ext: PopupExtension) => {
    setExtensionName(ext.name);
    setExtensionIcon(ext.icon);
    setExtensionColor(ext.color);
    setExtensionSize(ext.size);
    setExtensionTitle(ext.title);
    setExtensionSubtitle(ext.subtitle || '');
    setContentItems(ext.content);
    setShowCloseButton(ext.showCloseButton);
    setBackdropClose(ext.backdropClose);
    setEditingExtension(ext);
    setActiveTab('create');
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Add content item
  const addContentItem = useCallback((type: PopupContentItem['type']) => {
    const newItem: PopupContentItem = {
      id: generateId(),
      type,
      content: type === 'divider' ? '' : type === 'list' ? 'Item 1\nItem 2\nItem 3' : type === 'heading' ? 'Section Title' : type === 'button' ? 'Click Me' : 'New content...',
    };
    setContentItems(prev => [...prev, newItem]);
  }, []);

  // Update content item
  const updateContentItem = useCallback((id: string, content: string) => {
    setContentItems(prev => prev.map(item => (item.id === id ? { ...item, content } : item)));
  }, []);

  // Remove content item
  const removeContentItem = useCallback((id: string) => {
    setContentItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Move content item
  const moveContentItem = useCallback((id: string, direction: 'up' | 'down') => {
    setContentItems(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newItems = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
      return newItems;
    });
  }, []);

  // Save extension
  const handleSave = useCallback(() => {
    const extension: PopupExtension = {
      id: editingExtension?.id || generateId(),
      name: extensionName,
      icon: extensionIcon,
      color: extensionColor,
      size: extensionSize,
      title: extensionTitle,
      subtitle: extensionSubtitle || undefined,
      content: contentItems,
      showCloseButton,
      backdropClose,
      createdAt: editingExtension?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onSave(extension);
    resetForm();
    setActiveTab('manage');
  }, [extensionName, extensionIcon, extensionColor, extensionSize, extensionTitle, extensionSubtitle, contentItems, showCloseButton, backdropClose, editingExtension, onSave, resetForm]);

  // Export extensions
  const handleExport = useCallback(() => {
    const data = JSON.stringify(extensions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'popup-extensions.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [extensions]);

  // Import extensions
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text) as PopupExtension[];
        imported.forEach(ext => {
          ext.id = generateId(); // Generate new IDs to avoid conflicts
          ext.createdAt = new Date(ext.createdAt);
          ext.updatedAt = new Date();
          onSave(ext);
        });
      } catch (err) {
        console.error('Failed to import extensions:', err);
      }
    };
    input.click();
  }, [onSave]);

  // Copy extension config
  const handleCopyConfig = useCallback(async () => {
    const config = {
      name: extensionName,
      icon: extensionIcon,
      color: extensionColor,
      size: extensionSize,
      title: extensionTitle,
      subtitle: extensionSubtitle,
      content: contentItems,
      showCloseButton,
      backdropClose,
    };
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }, [extensionName, extensionIcon, extensionColor, extensionSize, extensionTitle, extensionSubtitle, contentItems, showCloseButton, backdropClose]);

  // Get icon component
  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find(opt => opt.value === iconName);
    return iconOption?.icon || Info;
  };

  // Render content item in preview
  const renderContentItem = (item: PopupContentItem) => {
    switch (item.type) {
      case 'heading':
        return <h3 className="text-lg font-bold text-white mb-2">{item.content}</h3>;
      case 'text':
        return <p className="text-gray-300 text-sm mb-3">{item.content}</p>;
      case 'list':
        return (
          <ul className="list-disc list-inside text-gray-300 text-sm mb-3 space-y-1">
            {item.content.split('\n').map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        );
      case 'divider':
        return <hr className="border-divider my-3" />;
      case 'button':
        return (
          <button
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors mb-3"
            style={{ backgroundColor: extensionColor }}
          >
            {item.content}
          </button>
        );
      default:
        return null;
    }
  };

  const IconComponent = getIconComponent(extensionIcon);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="popup-creator-title"
    >
      <div className="w-full max-w-5xl h-[90vh] mx-4 bg-surface border border-divider rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider shrink-0">
          <h2 id="popup-creator-title" className="text-lg font-bold flex items-center gap-2">
            <span className="text-primary">POPUP EXTENSION</span>
            <span className="text-gray-400 text-sm font-normal">- Creator Studio</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-lg transition-colors ${showPreview ? 'bg-primary/20 text-primary' : 'bg-surface-light text-gray-400 hover:text-white'}`}
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-light transition-colors"
              aria-label="Close popup creator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-divider shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              {editingExtension ? 'Edit Extension' : 'Create New'}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'manage'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <List className="w-4 h-4" />
              Manage ({extensions.length})
            </span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {activeTab === 'create' ? (
            <>
              {/* Editor Panel */}
              <div className={`${showPreview ? 'w-1/2' : 'w-full'} overflow-y-auto p-5 border-r border-divider`}>
                {/* Extension Name */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-400 uppercase mb-1.5">Extension Name</label>
                  <input
                    type="text"
                    value={extensionName}
                    onChange={(e) => setExtensionName(e.target.value)}
                    className="w-full bg-surface-light border border-divider rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="My Extension"
                  />
                </div>

                {/* Collapsible Sections */}
                {/* Appearance Section */}
                <div className="mb-3 border border-divider rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'appearance' ? null : 'appearance')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-surface-light hover:bg-surface transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Palette className="w-4 h-4 text-primary" />
                      Appearance
                    </span>
                    {expandedSection === 'appearance' ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {expandedSection === 'appearance' && (
                    <div className="p-4 space-y-4">
                      {/* Icon Selection */}
                      <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1.5">Icon</label>
                        <div className="grid grid-cols-6 gap-2">
                          {ICON_OPTIONS.map(({ value, icon: Icon, label }) => (
                            <button
                              key={value}
                              onClick={() => setExtensionIcon(value)}
                              title={label}
                              className={`p-2 rounded-lg border transition-all ${
                                extensionIcon === value
                                  ? 'border-primary bg-primary/20 text-primary'
                                  : 'border-divider bg-surface-light text-gray-400 hover:text-white hover:border-gray-600'
                              }`}
                            >
                              <Icon className="w-4 h-4 mx-auto" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Selection */}
                      <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1.5">Color</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {COLOR_PRESETS.map(({ name, value }) => (
                            <button
                              key={value}
                              onClick={() => setExtensionColor(value)}
                              title={name}
                              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                extensionColor === value ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: value }}
                            />
                          ))}
                          <input
                            type="color"
                            value={extensionColor}
                            onChange={(e) => setExtensionColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer"
                            title="Custom color"
                          />
                        </div>
                      </div>

                      {/* Size Selection */}
                      <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1.5">Size</label>
                        <div className="flex gap-2 flex-wrap">
                          {SIZE_OPTIONS.map(({ value, label }) => (
                            <button
                              key={value}
                              onClick={() => setExtensionSize(value as typeof extensionSize)}
                              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                extensionSize === value
                                  ? 'border-primary bg-primary/20 text-primary'
                                  : 'border-divider bg-surface-light text-gray-400 hover:text-white'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Header Section */}
                <div className="mb-3 border border-divider rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'header' ? null : 'header')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-surface-light hover:bg-surface transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Type className="w-4 h-4 text-primary" />
                      Header
                    </span>
                    {expandedSection === 'header' ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {expandedSection === 'header' && (
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1.5">Title</label>
                        <input
                          type="text"
                          value={extensionTitle}
                          onChange={(e) => setExtensionTitle(e.target.value)}
                          className="w-full bg-surface-light border border-divider rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                          placeholder="Extension Title"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1.5">Subtitle (optional)</label>
                        <input
                          type="text"
                          value={extensionSubtitle}
                          onChange={(e) => setExtensionSubtitle(e.target.value)}
                          className="w-full bg-surface-light border border-divider rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                          placeholder="Optional subtitle"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="mb-3 border border-divider rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'content' ? null : 'content')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-surface-light hover:bg-surface transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Layout className="w-4 h-4 text-primary" />
                      Content ({contentItems.length})
                    </span>
                    {expandedSection === 'content' ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {expandedSection === 'content' && (
                    <div className="p-4 space-y-3">
                      {/* Add Content Buttons */}
                      <div className="flex gap-2 flex-wrap mb-4">
                        {CONTENT_TYPES.map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => addContentItem(value as PopupContentItem['type'])}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-surface-light border border-divider rounded-lg hover:border-primary hover:text-primary transition-colors"
                          >
                            <Icon className="w-3 h-3" />
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Content Items */}
                      <div className="space-y-2">
                        {contentItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-2 bg-surface rounded-lg p-3 border border-divider"
                          >
                            <div className="flex flex-col gap-1 pt-1">
                              <button
                                onClick={() => moveContentItem(item.id, 'up')}
                                disabled={index === 0}
                                className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <GripVertical className="w-3 h-3 text-gray-600" />
                              <button
                                onClick={() => moveContentItem(item.id, 'down')}
                                disabled={index === contentItems.length - 1}
                                className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex-1">
                              <span className="text-[10px] text-gray-500 uppercase">{item.type}</span>
                              {item.type === 'divider' ? (
                                <hr className="border-divider my-2" />
                              ) : (
                                <textarea
                                  value={item.content}
                                  onChange={(e) => updateContentItem(item.id, e.target.value)}
                                  rows={item.type === 'list' ? 3 : 2}
                                  className="w-full bg-surface-light border border-divider rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-primary resize-none mt-1"
                                  placeholder={item.type === 'list' ? 'One item per line' : 'Enter content...'}
                                />
                              )}
                            </div>
                            <button
                              onClick={() => removeContentItem(item.id)}
                              className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Behavior Section */}
                <div className="mb-4 border border-divider rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'behavior' ? null : 'behavior')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-surface-light hover:bg-surface transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Settings className="w-4 h-4 text-primary" />
                      Behavior
                    </span>
                    {expandedSection === 'behavior' ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {expandedSection === 'behavior' && (
                    <div className="p-4 space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showCloseButton}
                          onChange={(e) => setShowCloseButton(e.target.checked)}
                          className="w-4 h-4 rounded border-divider bg-surface-light accent-primary"
                        />
                        <span className="text-sm text-gray-300">Show close button</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={backdropClose}
                          onChange={(e) => setBackdropClose(e.target.checked)}
                          className="w-4 h-4 rounded border-divider bg-surface-light accent-primary"
                        />
                        <span className="text-sm text-gray-300">Close on backdrop click</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingExtension ? 'Update Extension' : 'Save Extension'}
                  </button>
                  <button
                    onClick={handleCopyConfig}
                    className="p-2.5 bg-surface-light border border-divider rounded-xl hover:border-primary hover:text-primary transition-colors"
                    title="Copy configuration"
                  >
                    {copySuccess ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {editingExtension && (
                    <button
                      onClick={resetForm}
                      className="p-2.5 bg-surface-light border border-divider rounded-xl hover:border-orange-500 hover:text-orange-400 transition-colors"
                      title="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Panel */}
              {showPreview && (
                <div className="w-1/2 overflow-hidden flex flex-col bg-black/30">
                  <div className="px-4 py-2 border-b border-divider bg-surface-light/50">
                    <span className="text-xs text-gray-400 uppercase">Live Preview</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                    {/* Preview Popup */}
                    <div
                      className={`w-full ${SIZE_OPTIONS.find(s => s.value === extensionSize)?.width || 'max-w-md'} bg-surface border border-divider rounded-2xl shadow-2xl overflow-hidden`}
                    >
                      {/* Preview Header */}
                      <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${extensionColor}20` }}
                          >
                            <IconComponent className="w-5 h-5" style={{ color: extensionColor }} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{extensionTitle || 'Title'}</h3>
                            {extensionSubtitle && (
                              <p className="text-xs text-gray-400">{extensionSubtitle}</p>
                            )}
                          </div>
                        </div>
                        {showCloseButton && (
                          <button className="p-2 rounded-full hover:bg-surface-light transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                          </button>
                        )}
                      </div>

                      {/* Preview Content */}
                      <div className="px-5 py-4 max-h-64 overflow-y-auto">
                        {contentItems.map((item) => (
                          <div key={item.id}>{renderContentItem(item)}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Manage Tab */
            <div className="flex-1 overflow-y-auto p-5">
              {/* Actions Bar */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">
                  {extensions.length} extension{extensions.length !== 1 ? 's' : ''} saved
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface-light border border-divider rounded-lg hover:border-primary hover:text-primary transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    Import
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={extensions.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface-light border border-divider rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                </div>
              </div>

              {/* Extensions List */}
              {extensions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mb-4">
                    <Layout className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400 mb-2">No extensions yet</p>
                  <p className="text-gray-500 text-sm mb-4">Create your first popup extension</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Extension
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {extensions.map((ext) => {
                    const ExtIcon = getIconComponent(ext.icon);
                    return (
                      <div
                        key={ext.id}
                        className="flex items-center gap-4 bg-surface-light border border-divider rounded-xl p-4 hover:border-gray-600 transition-colors"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${ext.color}20` }}
                        >
                          <ExtIcon className="w-6 h-6" style={{ color: ext.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{ext.name}</h4>
                          <p className="text-xs text-gray-400 truncate">{ext.title}</p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {ext.content.length} item{ext.content.length !== 1 ? 's' : ''} | Size: {ext.size}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => loadExtension(ext)}
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(ext.id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
