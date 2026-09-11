'use client';

import { useState } from 'react';

import { usePatientData } from '@/hooks/usePatientData';
import { Shield, Activity, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'patients'|'resources'|'reference'>('patients');

  // We reuse usePatientData here with an empty ID to just get the 'otherPatients' list
  // Note: in a real app, an admin hook would subscribe to all patients. 
  // Our inMemoryStore handles allPatients gracefully.
  const { otherPatients, resources, loading } = usePatientData('pt_ind_001');
  const allPatients = otherPatients; // it includes all since we are just borrowing the hook

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={32} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-neutral-800 dark:text-neutral-200">
      {/* Header */}
      <header className="border-b border-panel-border bg-[#0a0a0a] p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Shield className="text-emerald-500" size={24} />
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">DATA MANAGEMENT</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 font-mono">TRIAGE-SYNC ADMIN CONSOLE</p>
          </div>
        </div>
        <Link href="/" className="px-4 py-2 bg-blue-900/30 text-blue-400 rounded-md text-sm hover:bg-blue-900/50 transition-colors">
          Return to Command Center
        </Link>
      </header>

      <div className="max-w-[1600px] mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] border-r border-panel-border p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('patients')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'patients' ? 'bg-neutral-800 text-white' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:bg-neutral-900'}`}
          >
            <Activity size={18} /> Patients
          </button>
          <button 
            onClick={() => setActiveTab('resources')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'resources' ? 'bg-neutral-800 text-white' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:bg-neutral-900'}`}
          >
            <Activity size={18} /> Resources
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8">
          {activeTab === 'patients' && (
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Patient Records</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Manage all registered emergency cases.</p>
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-500" />
                  <input 
                    type="text" 
                    placeholder="Search patients..." 
                    className="bg-neutral-100 dark:bg-neutral-900 border border-panel-border rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-panel-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-100 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 border-b border-panel-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">ID</th>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Age/Sex</th>
                      <th className="px-6 py-4 font-medium">Triage</th>
                      <th className="px-6 py-4 font-medium">State</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {allPatients.map(pt => (
                      <tr key={pt.id} className="hover:bg-neutral-100 dark:bg-neutral-900/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-neutral-500 dark:text-neutral-500">{pt.id}</td>
                        <td className="px-6 py-4 font-medium text-neutral-800 dark:text-neutral-200">{pt.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{pt.age} {pt.gender}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-neutral-800 rounded text-xs">
                            {pt.triageCategory || 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            pt.severity === 'CRITICAL' || pt.state === 'ACTION_PENDING' ? 'bg-red-950/50 text-red-400' :
                            pt.state === 'CONFLICT_DETECTED' ? 'bg-amber-950/50 text-amber-400' :
                            'bg-blue-950/50 text-blue-400'
                          }`}>
                            {pt.state}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-blue-400 hover:text-blue-300 text-xs uppercase tracking-wider font-bold">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Hospital Resources</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Manage real-time ER/ICU resource availability.</p>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-panel-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-100 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 border-b border-panel-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Resource</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Location</th>
                      <th className="px-6 py-4 font-medium text-right">Available / Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {resources.map(res => (
                      <tr key={res.id} className="hover:bg-neutral-100 dark:bg-neutral-900/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-neutral-800 dark:text-neutral-200">{res.name}</td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 capitalize">{res.type.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{res.location}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-mono ${res.available === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {res.available}
                          </span>
                          <span className="text-neutral-600 mx-1">/</span>
                          <span className="font-mono text-neutral-600 dark:text-neutral-400">{res.quantity}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
