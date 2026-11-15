/* Map recovery controls: imagery can fail without hiding the globe. */
(() => {
  const el=id=>document.getElementById(id);
  // Basemap switching is now owned by the Earth Explorer controls in index.html.
  el('switchBasemap')?.addEventListener('click',()=>{
    const options=['satellite','streets','offline'];
    earthState.basemap=options[(options.indexOf(earthState.basemap)+1)%options.length];
    el('earthBasemap').value=earthState.basemap;
    applyEarthControls();
  });
  el('resetCamera')?.addEventListener('click',()=>{
    viewers.forEach(v=>v?.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(79,22,4400000),duration:1}));
  });
  el('fitCamera')?.addEventListener('click',()=>{
    if(!filtered.length){el('mapHealth').textContent='Import CSV files before fitting detections.';return}
    let south=90,north=-90,west=180,east=-180;
    const stride=Math.max(1,Math.ceil(filtered.length/50000));
    for(let i=0;i<filtered.length;i+=stride){
      const r=filtered[i];south=Math.min(south,r.latitude);north=Math.max(north,r.latitude);
      west=Math.min(west,r.longitude);east=Math.max(east,r.longitude);
    }
    if(north-south<0.5){north+=.25;south-=.25}
    if(east-west<0.5){east+=.25;west-=.25}
    const rectangle=Cesium.Rectangle.fromDegrees(Math.max(-180,west-1),Math.max(-90,south-1),Math.min(180,east+1),Math.min(90,north+1));
    viewers.forEach(v=>v?.camera.flyTo({destination:rectangle,duration:1.1}));
  });
  // Force Cesium canvas resize after page switches and window resize.
  window.addEventListener('resize',()=>viewers.forEach(v=>v?.resize()));

})();
