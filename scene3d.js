import * as THREE from './vendor/three.module.js';

const material = (color, opts={}) => new THREE.MeshStandardMaterial({color, roughness:.45, ...opts});
const glass = new THREE.MeshPhysicalMaterial({color:0xe8fbfc, roughness:.15, transmission:.55, thickness:.2, transparent:true, opacity:.52, side:THREE.DoubleSide, depthWrite:false});
const rim = material(0xc7e8e8,{metalness:.25,roughness:.2});
function add(parent, geometry, mat, x=0,y=0,z=0,rx=0,ry=0,rz=0){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);parent.add(m);return m;}
function pedestal(g){add(g,new THREE.CylinderGeometry(1.14,1.2,.11,64),material(0xf6ead1),0,-1.34);add(g,new THREE.TorusGeometry(1.14,.03,10,64),material(0xe8c596,{metalness:.3}),0,-1.275,0,Math.PI/2);}
function cup(g,tea=false,withHandle=!tea){
  add(g,new THREE.CylinderGeometry(.78,.62,2.05,64,1,true),glass,0,-.16);
  add(g,new THREE.CylinderGeometry(.64,.64,.04,64),rim,0,-1.2);
  add(g,new THREE.TorusGeometry(.78,.044,12,64),rim,0,.87,0,Math.PI/2);
  const liquid=tea?0xa65f2d:0x83bfca;
  const body=add(g,new THREE.CylinderGeometry(.69,.58,1.34,64),material(liquid,{transparent:true,opacity:.88,roughness:.22}),0,-.5);
  const surface=add(g,new THREE.CylinderGeometry(.69,.69,.015,64),material(liquid,{roughness:.2}),0,.18);
  if(withHandle){
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.7,.45,0),new THREE.Vector3(1.2,.4,0),new THREE.Vector3(1.35,-.1,0),new THREE.Vector3(1.13,-.58,0),new THREE.Vector3(.64,-.5,0)]);
    add(g,new THREE.TubeGeometry(curve,32,.07,10,false),rim);
  }
  return {body,surface};
}
function water(){
  const g=new THREE.Group();pedestal(g);cup(g);
  const steam=new THREE.Group();g.add(steam);
  for(let i=0;i<3;i++){
    const x=(i-1)*.32;
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,1,0),new THREE.Vector3(x+.1,1.25,0),new THREE.Vector3(x-.08,1.48,0),new THREE.Vector3(x+.08,1.72,0)]);
    add(steam,new THREE.TubeGeometry(curve,20,.025,6,false),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7}));
  }
  g.userData.animate=t=>{steam.position.y=Math.sin(t*1.6)*.07;};return g;
}
function packetTexture(){
  const c=document.createElement('canvas');c.width=512;c.height=640;const ctx=c.getContext('2d');
  ctx.fillStyle='#e9954c';ctx.fillRect(0,0,512,640);ctx.fillStyle='#fff0d1';ctx.fillRect(30,30,452,580);
  ctx.fillStyle='#d47938';ctx.fillRect(30,30,452,120);ctx.fillStyle='#fff7e8';ctx.textAlign='center';ctx.font='bold 39px Arial';ctx.fillText('FAIRWOOD',256,105);
  ctx.fillStyle='#61432e';ctx.font='bold 72px Arial';ctx.fillText('MILK',256,292);ctx.fillText('TEA',256,376);ctx.font='bold 31px Arial';ctx.fillText('POWDER',256,467);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function powder(){
  const g=new THREE.Group();pedestal(g);const p=new THREE.Group();p.position.set(-.1,.04,0);p.rotation.set(.05,-.2,-.1);g.add(p);
  add(p,new THREE.BoxGeometry(1.58,2.24,.2),material(0xe8a25e));
  add(p,new THREE.PlaneGeometry(1.52,2.18),material(0xffffff,{map:packetTexture(),side:THREE.DoubleSide}),0,0,.106);
  add(p,new THREE.BoxGeometry(1.7,.12,.25),material(0xf8c794),0,1.14);add(p,new THREE.BoxGeometry(1.7,.12,.25),material(0xf8c794),0,-1.14);
  const particles=[];for(let i=0;i<12;i++){particles.push(add(g,new THREE.IcosahedronGeometry(.035+(i%3)*.015),material(0xb77739),.5,0,.3));}
  g.userData.animate=t=>{p.rotation.z=-.1+Math.sin(t*1.2)*.04;particles.forEach((s,i)=>{const q=(t*.45+i*.13)%1;s.position.set(.59+q*.18,.25-q*1.4,.25+Math.sin(q*8+i)*.08);s.scale.setScalar(1-q*.45);});};return g;
}
function tea(){
  const g=new THREE.Group();pedestal(g);cup(g,true);
  add(g,new THREE.CylinderGeometry(.81,.81,.06,64),material(0xffe5b2),0,.92);
  add(g,new THREE.TorusGeometry(.81,.035,10,64),material(0xdab788,{metalness:.25}),0,.96,0,Math.PI/2);
  const straw=add(g,new THREE.CylinderGeometry(.055,.055,1.8,12),material(0xffebc8),.27,1.35,0,0,0,.17);
  const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#fff0cd';ctx.fillRect(0,0,256,128);ctx.fillStyle='#7b4e2c';ctx.textAlign='center';ctx.font='bold 35px Arial';ctx.fillText('MILK TEA',128,78);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  add(g,new THREE.PlaneGeometry(.9,.45),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}),0,-.32,.725);
  g.userData.animate=t=>{straw.rotation.z=.17+Math.sin(t)*.02;};return g;
}
function tabletFaceTexture(){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const c=canvas.getContext('2d');
  c.clearRect(0,0,256,256);c.fillStyle='#d79b60';
  [[76,86,8],[151,61,5],[183,111,7],[91,167,6],[155,182,9],[126,126,5]].forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();});
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function tabletPiece(parent,radius=.75){
  const tablet=new THREE.Group();parent.add(tablet);
  const face=material(0xf7d9aa,{roughness:.78});
  add(tablet,new THREE.CylinderGeometry(radius,radius,.22,64),face);
  add(tablet,new THREE.TorusGeometry(radius-.035,.028,10,64),material(0xf1c893,{roughness:.75}),0,.12,0,Math.PI/2);
  add(tablet,new THREE.CircleGeometry(radius*.7,64),new THREE.MeshBasicMaterial({map:tabletFaceTexture(),transparent:true,side:THREE.DoubleSide,depthWrite:false}),0,.123,0,-Math.PI/2);
  return tablet;
}
function hospitalWater(){
  const g=new THREE.Group();pedestal(g);cup(g,false,false);
  const steam=new THREE.Group();g.add(steam);
  for(let i=0;i<2;i++){
    const x=(i-.5)*.38;
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,.98,0),new THREE.Vector3(x+.08,1.24,0),new THREE.Vector3(x-.07,1.5,0)]);
    add(steam,new THREE.TubeGeometry(curve,20,.02,6,false),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.58}));
  }
  g.userData.animate=t=>{steam.position.y=Math.sin(t*1.4)*.06;};return g;
}
function hospitalTablet(){
  const g=new THREE.Group();pedestal(g);
  const piece=tabletPiece(g,.86);piece.position.y=-.78;piece.rotation.set(.3,0,.2);
  g.userData.animate=t=>{piece.rotation.y=t*.18;};return g;
}
function hospitalMix(){
  const g=new THREE.Group();pedestal(g);
  const liquid=cup(g,false,false);
  const pill=tabletPiece(g,.47);
  const bubbleMaterial=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.05,transparent:true,opacity:.8,depthWrite:false});
  const bubbles=[];
  for(let i=0;i<32;i++) bubbles.push(add(g,new THREE.SphereGeometry(.04+(i%5)*.01,12,8),bubbleMaterial));
  const clear=new THREE.Color(0x83bfca),orange=new THREE.Color(0xf0a54f);
  g.userData.reset=()=>{
    liquid.body.material.color.copy(clear);liquid.surface.material.color.copy(clear);
    pill.visible=true;pill.scale.setScalar(1);bubbles.forEach(b=>b.visible=false);
  };
  g.userData.animateMix=elapsed=>{
    const t=Math.min(elapsed,7.2);
    const fall=Math.min(1,Math.max(0,(t-.6)/1.45));
    pill.position.set(.26-.26*fall,1.65-1.36*fall,.18);
    pill.rotation.set(.3+fall*.65,0,.2+fall*.2);
    const dissolve=Math.min(1,Math.max(0,(t-2)/3.8));
    pill.scale.setScalar(Math.max(.001,1-dissolve));pill.visible=t<5.8;
    liquid.body.material.color.copy(clear).lerp(orange,dissolve);
    liquid.surface.material.color.copy(clear).lerp(orange,dissolve);
    bubbles.forEach((bubble,i)=>{
      const onset=1.55+(i%8)*.18;
      const q=(t-onset)*.65+i*.23;
      bubble.visible=t>onset&&t<6.6;
      if(!bubble.visible)return;
      const rise=q-Math.floor(q);
      bubble.position.set(Math.sin(i*2.4+q*4)*(.12+rise*.31),-.75+rise*1.7,Math.cos(i*1.7+q*3)*(.1+rise*.26));
      bubble.scale.setScalar(.65+rise*.75);
    });
  };
  g.userData.reset();return g;
}
function mixingModel(){
  const g=new THREE.Group();
  const mug=new THREE.Group();mug.position.x=-.37;g.add(mug);pedestal(mug);
  const liquid=cup(mug);
  const packet=new THREE.Group();g.add(packet);
  add(packet,new THREE.BoxGeometry(1.1,1.48,.16),material(0xe8a25e));
  add(packet,new THREE.PlaneGeometry(1.05,1.42),material(0xffffff,{map:packetTexture(),side:THREE.DoubleSide}),0,0,.087);
  add(packet,new THREE.BoxGeometry(1.17,.09,.2),material(0xf8c794),0,.76);
  const grains=[];
  for(let i=0;i<36;i++) grains.push(add(g,new THREE.IcosahedronGeometry(.025+(i%4)*.009),material(0xb77739),0,0,.25));
  const swirls=[];
  for(let i=0;i<3;i++){
    const m=add(mug,new THREE.TorusGeometry(.18+i*.15,.012,6,64),new THREE.MeshBasicMaterial({color:0xe8b480,transparent:true,opacity:0,depthWrite:false}),0,.205+i*.006,0,Math.PI/2);
    swirls.push(m);
  }
  const blue=new THREE.Color(0x83bfca),brown=new THREE.Color(0xa65f2d);
  g.userData.animateMix=elapsed=>{
    const t=Math.min(elapsed,7.2);
    packet.visible=t<6.2;
    packet.position.set(.95,1.6+Math.max(0,1-t)*.55,.18);
    packet.rotation.set(.04,-.22,-.54*Math.min(1,Math.max(0,(t-.35)/.75)));
    const dissolve=Math.min(1,Math.max(0,(t-2)/3.7));
    liquid.body.material.color.copy(blue).lerp(brown,dissolve);
    liquid.surface.material.color.copy(blue).lerp(brown,dissolve);
    grains.forEach((grain,i)=>{
      const delay=.9+(i%18)*.18+Math.floor(i/18)*.12;
      const p=(t-delay)/1.2;
      grain.visible=p>=0&&p<1&&t<5.8;
      if(!grain.visible)return;
      if(p<.68){
        const q=p/.68;
        grain.position.set(.44-.81*q+Math.sin(i*2.1)*.06,1.15-.94*q,.18+Math.sin(i*1.7)*.1);
        grain.scale.setScalar(1);
      }else{
        const q=(p-.68)/.32;
        grain.position.set(-.37+Math.sin(i*1.9+q*5)*(.4*(1-q)),.19-.4*q,.1+Math.cos(i*2.3+q*4)*.22);
        grain.scale.setScalar(Math.max(.01,1-q));
      }
    });
    swirls.forEach((s,i)=>{s.visible=t>1.5&&t<6.2;s.material.opacity=s.visible ? .45*(1-dissolve*.6) : 0;s.rotation.z=t*(1+i*.35);});
  };
  g.userData.reset=()=>{liquid.body.material.color.copy(blue);liquid.surface.material.color.copy(blue);packet.visible=true;grains.forEach(s=>s.visible=false);swirls.forEach(s=>s.visible=false);};
  g.userData.reset();
  return g;
}
export function createScene3D(container){
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);container.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,1.05,5.9);camera.lookAt(0,.1,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0xb78b65,2.7));
  const light=new THREE.DirectionalLight(0xffffff,3.4);light.position.set(-3,5,6);scene.add(light);
  const fill=new THREE.DirectionalLight(0xffcf98,1.7);fill.position.set(4,2,-4);scene.add(fill);
  const models={water:water(),powder:powder(),tea:tea(),mix:mixingModel(),hospitalWater:hospitalWater(),hospitalTablet:hospitalTablet(),hospitalMix:hospitalMix()};Object.values(models).forEach(m=>{m.visible=false;scene.add(m);});let active=models.water;active.visible=true;
  let mixing=null;
  let dragging=false,lastX=0,lastY=0,pitch=0;
  container.addEventListener('pointerdown',e=>{if(mixing)return;dragging=true;lastX=e.clientX;lastY=e.clientY;container.setPointerCapture(e.pointerId);});
  container.addEventListener('pointermove',e=>{if(!dragging)return;active.rotation.y+=(e.clientX-lastX)*.008;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastY)*.004,-.25,.25);active.rotation.x=pitch;lastX=e.clientX;lastY=e.clientY;});
  container.addEventListener('pointerup',()=>{dragging=false;});container.addEventListener('pointercancel',()=>{dragging=false;});
  const resize=()=>{const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  let frame,lastFrameMs=0;const animate=ms=>{
    frame=requestAnimationFrame(animate);
    const delta=lastFrameMs ? Math.min(.1,(ms-lastFrameMs)/1000) : 0;
    lastFrameMs=ms;
    if(document.hidden)return;
    const t=ms/1000;
    if(mixing){
      mixing.elapsed+=delta;
      const elapsed=mixing.elapsed;
      active.userData.animateMix(elapsed);
      mixing.progress?.(Math.min(1,elapsed/7.2));
      if(elapsed>=7.2){const done=mixing.done;mixing=null;done?.();}
    }else{if(!dragging)active.rotation.y+=.003;active.position.y=Math.sin(t*1.4)*.05;active.userData.animate?.(t);}
    renderer.render(scene,camera);
  };frame=requestAnimationFrame(animate);
  return{
    setItem(name){mixing=null;active.visible=false;active=models[name]||models.water;active.visible=true;active.rotation.set(0,0,0);active.position.y=0;camera.position.z=5.9;camera.lookAt(0,.1,0);pitch=0;},
    playMix(name,done,progress){active.visible=false;active=models[name]||models.mix;active.visible=true;active.rotation.set(0,0,0);active.position.y=0;active.userData.reset();camera.position.z=name==='hospitalMix' ? 5.9 : 6.7;camera.lookAt(0,name==='hospitalMix' ? .1 : .3,0);dragging=false;mixing={elapsed:0,done,progress};},
    dispose(){cancelAnimationFrame(frame);observer.disconnect();renderer.dispose();renderer.domElement.remove();}
  };
}
