
function HomeLayout({ firstVisit, loading } : any) {
  return (
    <div style={{background: "linear-gradient(170.28deg, #1B231E -9.44%, #0D120E 100%)" }} className="flex justify-between flex-col gap-3">
      <img className="w-64 pt-2 pl-1 mb-2" src="assets/logo-dark-transparent-horizontal.svg" />

      <img className="w-full mt-2" src="assets/home-life-spheres-girl.svg" />
      
    </div>
  )
}

export default HomeLayout
