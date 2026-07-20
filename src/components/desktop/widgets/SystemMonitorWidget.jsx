function SystemMonitorWidget() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl text-white transition hover:bg-white/10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/70">System Monitor</h3>
        <span className="text-xs text-green-400">Online</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>CPU Usage</span>
            <span>24%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-[24%]" />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>RAM Usage</span>
            <span>4.2 GB / 16 GB</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full w-[26%]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemMonitorWidget
