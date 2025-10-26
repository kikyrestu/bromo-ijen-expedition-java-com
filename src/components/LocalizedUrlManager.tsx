'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Globe, RefreshCw, Save, AlertCircle } from 'lucide-react';

interface LocalizedUrlSettings {
  id: string;
  contentType: string;
  urlPaths: {
    id: string;
    en: string;
    de: string;
    nl: string;
    zh: string;
  };
  autoGenerate: boolean;
  customPattern?: string;
}

interface LocalizedUrlManagerProps {
  onClose: () => void;
}

export default function LocalizedUrlManager({ onClose }: LocalizedUrlManagerProps) {
  const [settings, setSettings] = useState<LocalizedUrlSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/localized-urls');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching settings' });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (index: number, field: string, value: any) => {
    const newSettings = [...settings];
    if (field.startsWith('urlPaths.')) {
      const pathField = field.split('.')[1];
      newSettings[index].urlPaths[pathField as keyof typeof newSettings[0]['urlPaths']] = value;
    } else {
      (newSettings[index] as any)[field] = value;
    }
    setSettings(newSettings);
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const promises = settings.map(setting => 
        fetch('/api/localized-urls', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentType: setting.contentType,
            urlPaths: setting.urlPaths,
            autoGenerate: setting.autoGenerate,
            customPattern: setting.customPattern
          })
        })
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(r => r.json()));

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        setMessage({ type: 'error', text: `Failed to save ${failed.length} settings` });
      } else {
        setMessage({ type: 'success', text: 'All settings saved successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const regenerateUrls = async (contentType: string) => {
    setRegenerating(contentType);
    setMessage(null);

    try {
      const response = await fetch('/api/localized-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Regenerated ${data.updatedCount} ${contentType} URLs` 
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to regenerate URLs' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error regenerating URLs' });
    } finally {
      setRegenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Globe className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Localized URL Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <Settings className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {settings.map((setting, index) => (
            <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                  {setting.contentType} URLs
                </h3>
                <button
                  onClick={() => regenerateUrls(setting.contentType)}
                  disabled={regenerating === setting.contentType}
                  className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  {regenerating === setting.contentType ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Regenerate
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {Object.entries(setting.urlPaths).map(([lang, path]) => (
                  <div key={lang}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {lang.toUpperCase()} Path
                    </label>
                    <input
                      type="text"
                      value={path || ''}
                      onChange={(e) => updateSetting(index, `urlPaths.${lang}`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter ${lang} path`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={setting.autoGenerate}
                    onChange={(e) => updateSetting(index, 'autoGenerate', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-generate URLs</span>
                </label>
              </div>

              {setting.customPattern && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Pattern
                  </label>
                  <input
                    type="text"
                    value={setting.customPattern}
                    onChange={(e) => updateSetting(index, 'customPattern', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Custom URL pattern"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

