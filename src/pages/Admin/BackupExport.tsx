import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Download, Upload, Database, FileText, Calendar, Image, Save, Clock, AlertCircle, CheckCircle, Users } from 'lucide-react';

interface BackupData {
  gallery: any[];
  activities: any[];
  events: any[];
  team_members: any[];
  volunteers: any[];
  timestamp: string;
  version: string;
}

const BackupExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Export all data
  const exportData = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      // Fetch all data from each table
      const [galleryData, activitiesData, eventsData, teamMembersData, volunteersData] = await Promise.all([
        supabase.from('gallery').select('*'),
        supabase.from('activities').select('*'),
        supabase.from('events').select('*'),
        supabase.from('team_members').select('*'),
        supabase.from('volunteers').select('*')
      ]);

      if (galleryData.error) throw galleryData.error;
      if (activitiesData.error) throw activitiesData.error;
      if (eventsData.error) throw eventsData.error;
      if (teamMembersData.error) throw teamMembersData.error;
      if (volunteersData.error) throw volunteersData.error;

      const backupData: BackupData = {
        gallery: galleryData.data || [],
        activities: activitiesData.data || [],
        events: eventsData.data || [],
        team_members: teamMembersData.data || [],
        volunteers: volunteersData.data || [],
        timestamp: new Date().toISOString(),
        version: '1.1'
      };

      // Create and download the backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abbaquar-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Backup exported successfully!' });
    } catch (error: any) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: `Export failed: ${error.message}` });
    } finally {
      setIsExporting(false);
    }
  };

  // Import data from backup file
  const importData = async (file: File) => {
    setIsImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);

      // Validate backup data structure
      if (!backupData.gallery || !backupData.activities || !backupData.events || !backupData.team_members || !backupData.volunteers) {
        throw new Error('Invalid backup file format');
      }

      // Confirm import
      if (!confirm(`This will replace all current data. Are you sure you want to import ${file.name}?`)) {
        return;
      }

      // Import data to each table
      const results = await Promise.all([
        supabase.from('gallery').delete().neq('id', '00000000-0000-0000-0000-000000000000'), // Delete all except dummy
        supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('volunteers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);

      // Check for delete errors
      for (const result of results) {
        if (result.error) throw result.error;
      }

      // Insert imported data
      const insertResults = await Promise.all([
        backupData.gallery.length > 0 ? supabase.from('gallery').insert(backupData.gallery) : Promise.resolve({ error: null }),
        backupData.activities.length > 0 ? supabase.from('activities').insert(backupData.activities) : Promise.resolve({ error: null }),
        backupData.events.length > 0 ? supabase.from('events').insert(backupData.events) : Promise.resolve({ error: null }),
        backupData.team_members.length > 0 ? supabase.from('team_members').insert(backupData.team_members) : Promise.resolve({ error: null }),
        backupData.volunteers.length > 0 ? supabase.from('volunteers').insert(backupData.volunteers) : Promise.resolve({ error: null })
      ]);

      // Check for insert errors
      for (const result of insertResults) {
        if (result.error) throw result.error;
      }

      setMessage({ type: 'success', text: 'Backup imported successfully!' });
    } catch (error: any) {
      console.error('Import error:', error);
      setMessage({ type: 'error', text: `Import failed: ${error.message}` });
    } finally {
      setIsImporting(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Backup & Export</h1>
          <p className="mt-2 text-white/70">Export your data for safekeeping or import from a backup file</p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="bg-[#1a365d]/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 p-6">
            <div className="flex items-center mb-4">
              <Download className="w-6 h-6 text-[#4f7df9] mr-3" />
              <h2 className="text-xl font-semibold text-white">Export Data</h2>
            </div>
            <p className="text-white/70 mb-4">
              Download all your content as a JSON backup file. This includes gallery images, activities, events, and team members.
            </p>
            <button
              onClick={exportData}
              disabled={isExporting}
              className="w-full flex items-center justify-center px-4 py-3 bg-[#4f7df9] text-white rounded-lg hover:bg-[#4f7df9]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Backup
                </>
              )}
            </button>
          </div>

          {/* Import Section */}
          <div className="bg-[#1a365d]/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 p-6">
            <div className="flex items-center mb-4">
              <Upload className="w-6 h-6 text-[#4f7df9] mr-3" />
              <h2 className="text-xl font-semibold text-white">Import Data</h2>
            </div>
            <p className="text-white/70 mb-4">
              Import data from a backup file. This will replace all current content, so make sure to export first.
            </p>
            <label className="w-full flex items-center justify-center px-4 py-3 bg-[#4f7df9] text-white rounded-lg hover:bg-[#4f7df9]/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50">
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Backup
                </>
              )}
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Data Overview */}
        <div className="bg-[#1a365d]/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 p-6">
          <div className="flex items-center mb-6">
            <Database className="w-6 h-6 text-[#4f7df9] mr-3" />
            <h2 className="text-xl font-semibold text-white">Data Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <Image className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Gallery Images</p>
              <p className="text-white/70 text-sm">Photos & media</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <FileText className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Activities</p>
              <p className="text-white/70 text-sm">Programmes & services</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Events</p>
              <p className="text-white/70 text-sm">Upcoming events</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <Users className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Leadership</p>
              <p className="text-white/70 text-sm">Royal House</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <Users className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Management</p>
              <p className="text-white/70 text-sm">Staff & directors</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <Users className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Volunteers</p>
              <p className="text-white/70 text-sm">Support team</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#1a365d]/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Backup Instructions</h3>
          <div className="space-y-3 text-white/70">
            <div className="flex items-start">
              <span className="bg-[#4f7df9] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</span>
              <p>Export your data regularly (weekly/monthly) to keep a safe copy of all your content.</p>
            </div>
            <div className="flex items-start">
              <span className="bg-[#4f7df9] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</span>
              <p>Store backup files in a secure location (cloud storage, external drive, etc.).</p>
            </div>
            <div className="flex items-start">
              <span className="bg-[#4f7df9] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</span>
              <p>Before importing, always export your current data first to avoid losing any recent changes.</p>
            </div>
            <div className="flex items-start">
              <span className="bg-[#4f7df9] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</span>
              <p>Import will replace all current data, so use with caution.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BackupExport; 