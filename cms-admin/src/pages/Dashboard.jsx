import React from 'react'
import { FileText, Users, Eye, ArrowUpRight } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { label: 'Published Articles', value: 342, icon: FileText, change: '+12' },
    { label: 'Total Authors', value: 14, icon: Users, change: '+2' },
    { label: 'Total Views', value: '1.2M', icon: Eye, change: '+12%' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-gray-100 pb-10">
        <h1 className="text-[56px] font-extrabold text-[var(--cms-accent)] tracking-tighter leading-[1.1] mb-4">Dashboard</h1>
        <p className="text-[16px] font-medium text-[var(--cms-text-secondary)] tracking-tight leading-[1.5]">Performance overview and site metrics</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--cms-text-secondary)] uppercase tracking-[0.1em] mb-2">{stat.label}</p>
                  <p className="text-5xl font-extrabold text-[var(--cms-text-primary)] tracking-tighter">{stat.value}</p>
                </div>
                <div className="p-4 bg-[var(--cms-accent-light)] text-[var(--cms-accent)] rounded-2xl group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center text-[var(--cms-success)]">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {stat.change}
                </span>
                <span className="text-[var(--cms-text-secondary)] ml-2">vs last period</span>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 mt-8">
        <h3 className="text-xl font-extrabold text-[var(--cms-text-primary)] tracking-tight mb-6">Recent Activity</h3>
        <div className="text-xs text-[var(--cms-text-secondary)] font-black uppercase tracking-widest py-16 text-center border-2 border-dashed border-gray-50 rounded-3xl">
          Analyzing latest data streams...
        </div>
      </div>
    </div>
  )
}
