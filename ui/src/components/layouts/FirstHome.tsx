function FirstHomeLayout({ startBtn, firstVisit = true }: any) {
  return (
    <div className="home-layout">
      <div className="action">{firstVisit && startBtn}</div>
      <div className="cta">
        <img
          className="w-64 pl-2 mb-2"
          src="assets/logo-dark-transparent-horizontal.svg"
        />
        <img className="make-or-break-img" src="assets/make-or-break.svg" />
        <img
          className={
            firstVisit ? "spheres-girl-img" : "spheres-girl-img indented"
          }
          src="assets/home-life-spheres-girl.svg"
        />
      </div>
    </div>
  );
}

export default FirstHomeLayout;
