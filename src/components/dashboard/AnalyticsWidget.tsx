
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { projects } from "../../data/mockData";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "../icons";

const AnalyticsWidget: React.FC = () => {
  // Mock data for the activity chart (last 7 days)
  const activityData = [45, 52, 38, 65, 42, 58, 70];
  const maxVal = Math.max(...activityData);
  
  // Generate SVG path for the area chart
  const points = activityData.map((val, i) => {
    const x = (i / (activityData.length - 1)) * 100;
    const y = 100 - (val / maxVal) * 80; // Leave some padding top/bottom
    return `${x},${y}`;
  });

  const pathD = `M0,100 L0,${100 - (activityData[0] / maxVal) * 80} ${points.map((p, i) => `L${p}`).join(' ')} L100,100 Z`;
  const lineD = `M0,${100 - (activityData[0] / maxVal) * 80} ${points.map((p, i) => `L${p}`).join(' ')}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Weekly Activity Chart */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Weekly Productivity</CardTitle>
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
              <TrendingUp size={14} />
              +12.5%
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tasks completed over the last 7 days</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-32 w-full relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(6 182 212)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(6 182 212)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" />

              {/* Area */}
              <motion.path 
                d={pathD} 
                fill="url(#chartGradient)" 
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              
              {/* Line */}
              <motion.path 
                d={lineD} 
                fill="none" 
                stroke="rgb(6 182 212)" 
                strokeWidth="2" 
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />

              {/* Points */}
              {points.map((p, i) => {
                 const [cx, cy] = p.split(',');
                 return (
                    <motion.circle 
                        key={i} 
                        cx={cx} 
                        cy={cy} 
                        r="1.5" // visual radius handled by vector-effect mostly, keeping small for logic
                        fill="white" 
                        stroke="rgb(6 182 212)" 
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
                    />
                 )
              })}
            </svg>
            
            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Status Bars */}
      <Card>
        <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Project Velocity</CardTitle>
                <ArrowRight size={16} className="text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Completion status of active projects</p>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
            {projects.slice(0, 3).map((project, index) => (
                <div key={project.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{project.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">{project.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                            className={`h-full rounded-full ${
                                project.status === 'delayed' ? 'bg-red-500' : 
                                project.status === 'at-risk' ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                        />
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsWidget;
