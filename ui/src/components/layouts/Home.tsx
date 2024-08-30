function HomeLayout({ startBtn, firstVisit } : any) {
  return (
    <div className="home-layout">
      {firstVisit && <div className="bottom">{startBtn}</div>}
      <div className="top">
        <img className="w-64 pt-2 pl-1 mb-2" src="assets/logo-dark-transparent-horizontal.svg" />
        <img className="make-or-break-img" src="assets/make-or-break.svg" />
        <img className={firstVisit ? "spheres-girl-img" : "spheres-girl-img indented"} src="assets/home-life-spheres-girl.svg" />
      </div>
    </div>
  )
}

export default HomeLayout
