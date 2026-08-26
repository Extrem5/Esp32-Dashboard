'use client';

import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Home() {
  const [logs, setLogs] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('ALL');

  // Poll database every 3 seconds for historical telemetry
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/telemetry');
        const data = await res.json();
        if (Array.isArray(data)) {
          setLogs(data);
        }
      } catch (err) {
        console.error("Error fetching telemetry:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Extract list of unique devices found in database logs
  const availableDevices = useMemo(() => {
    const devices = new Set(logs.map(log => log.deviceId || 'ESP32_Default'));
    return Array.from(devices);
  }, [logs]);

  // Filter logs for the selected device
  const deviceLogs = useMemo(() => {
    if (selectedDevice === 'ALL') return logs;
    return logs.filter(log => (log.deviceId || 'ESP32_Default') === selectedDevice);
  }, [logs, selectedDevice]);

  // Reverse data chronological order so charts read Left -> Right (Oldest -> Newest)
  const chartData = useMemo(() => {
    return [...deviceLogs].reverse().map(log => ({
      ...log,
      timeFormatted: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      freeRamKB: log.freeRam ? (log.freeRam / 1024).toFixed(1) : null,
      minFreeRamKB: log.minFreeRam ? (log.minFreeRam / 1024).toFixed(1) : null,
    }));
  }, [deviceLogs]);

  // Latest reading for selected target
  const latestReading = deviceLogs[0] || null;

  // Dynamic feature detection logic: check if field exists in log entries
  const hasTemperature = chartData.some(item => item.temperature !== null && item.temperature !== undefined);
  const hasRam = chartData.some(item => item.freeRamKB !== null && item.freeRamKB !== undefined);
  const hasMinRam = chartData.some(item => item.minFreeRamKB !== null && item.minFreeRamKB !== undefined);
  const hasRssi = chartData.some(item => item.rssi !== null && item.rssi !== undefined);

  // Capacitive Touch Pin Detection: Values < 30 indicate human touch
  const isCurrentlyTouched = latestReading?.touchPin !== undefined && latestReading.touchPin !== null && latestReading.touchPin < 30;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Navbar / Top Bar */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">IoT Telemetry Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              PostgreSQL / Supabase
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time dynamic monitoring stream for ESP32 hardware clusters
          </p>
        </div>

        {/* Device Selector Dropdown */}
        <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
          <label className="text-xs text-slate-400 font-medium pl-1">Device Select:</label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="bg-slate-800 text-white text-sm font-mono rounded px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Boards ({availableDevices.length})</option>
            {availableDevices.map(dev => (
              <option key={dev} value={dev}>{dev}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Temperature Status */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chip Temp</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-mono font-bold text-white">
                {latestReading?.temperature !== undefined ? `${Number(latestReading.temperature).toFixed(1)}°C` : '--'}
              </span>
              <span className="text-xs text-indigo-400 font-mono">Sens: Internal</span>
            </div>
          </div>

          {/* Wi-Fi RSSI */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Signal (RSSI)</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-mono font-bold text-white">
                {latestReading?.rssi !== undefined ? `${latestReading.rssi} dBm` : '--'}
              </span>
              <span className={`text-xs font-semibold ${latestReading?.rssi > -65 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {latestReading?.rssi > -65 ? 'Excellent' : 'Fair'}
              </span>
            </div>
          </div>

          {/* Capacitive Touch Event Badge */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Touch Sensor (GPIO 4)</span>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-lg font-mono font-bold text-white">
                Val: {latestReading?.touchPin !== undefined ? latestReading.touchPin : '--'}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                isCurrentlyTouched 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {isCurrentlyTouched ? 'TOUCHED!' : 'Idle'}
              </span>
            </div>
          </div>

          {/* Hardware Uptime */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Board Uptime</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-mono font-bold text-white">
                {latestReading?.uptime !== undefined ? `${latestReading.uptime}s` : '--'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {latestReading?.deviceId || 'ESP32'}
              </span>
            </div>
          </div>

        </div>

        {/* Dynamic Recharts Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Chart 1: Temperature Trend (Rendered only if data exists) */}
          {hasTemperature && (
            <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-indigo-300">Temperature Log (°C)</h3>
                <span className="text-xs text-slate-500 font-mono">Time-Series</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timeFormatted" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
                    <Line type="monotone" dataKey="temperature" stroke="#818cf8" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Memory Analytics (Rendered only if RAM data exists) */}
          {(hasRam || hasMinRam) && (
            <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-emerald-400">RAM Allocation (KB)</h3>
                <div className="flex gap-3 text-xs">
                  {hasRam && <span className="text-emerald-400 font-mono">• Free RAM</span>}
                  {hasMinRam && <span className="text-amber-400 font-mono">• Lowest RAM</span>}
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timeFormatted" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
                    {hasRam && <Line type="monotone" dataKey="freeRamKB" stroke="#34d399" strokeWidth={2} dot={false} />}
                    {hasMinRam && <Line type="monotone" dataKey="minFreeRamKB" stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 4" dot={false} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Wi-Fi Signal Strength (Rendered only if RSSI data exists) */}
          {hasRssi && (
            <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-sky-400">Wi-Fi Signal Strength (dBm)</h3>
                <span className="text-xs text-slate-500 font-mono">Higher = Better</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timeFormatted" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
                    <Line type="monotone" dataKey="rssi" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}