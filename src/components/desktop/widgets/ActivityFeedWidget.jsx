function ActivityFeedWidget() {
  const activities = [
    { id: 1, title: 'Deployed OS11 update', time: '2 mins ago', icon: '🚀' },
    { id: 2, title: 'Merged PR #42 in Open-Source', time: '1 hr ago', icon: '🐙' },
    { id: 3, title: 'Finished React Course', time: 'Yesterday', icon: '🎓' },
  ]

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl transition hover:bg-white/10 text-white">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/70">Recent Activity</h3>
      </div>
      
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">
              {activity.icon}
            </div>
            <div>
              <p className="text-sm font-medium leading-tight text-white/90">{activity.title}</p>
              <p className="text-xs text-white/50 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityFeedWidget
