function TestApp({ title = 'Test App' }) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col justify-center rounded-b-win-lg bg-gradient-to-br from-sky-400 to-indigo-600 p-8 text-white">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-white/80">
        This is a placeholder app window. You can still drag, resize, minimize,
        maximize, and close from the title bar.
      </p>
    </div>
  )
}

export default TestApp
