function SpotifyWidget() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl transition hover:bg-white/10 overflow-hidden">
      <iframe 
        style={{ borderRadius: '12px' }} 
        src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0" 
        width="100%" 
        height="152" 
        frameBorder="0" 
        allowFullScreen="" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
        title="Spotify Lofi Playlist"
      />
    </div>
  )
}

export default SpotifyWidget
