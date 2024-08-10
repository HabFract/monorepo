function HomeLayout({ startBtn, firstVisit, loading } : any) {
  return (
    <div className="home-layout">
      <div className="bottom">{startBtn}</div>
      <div className="top">
        <img className="w-64 pt-2 pl-1 mb-2" src="assets/logo-dark-transparent-horizontal.svg" />
        <img className="make-or-break-img" src="assets/make-or-break.svg" />
        <img className="spheres-girl-img" src="assets/home-life-spheres-girl.svg" />
      </div>
    </div>
  )
}

export default HomeLayout
