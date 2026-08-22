/* ============================================================
   FLOZA — Shared Script
   ============================================================ */
(function(){

  /* === CUSTOM CURSOR === */
  const dot=document.getElementById('cursorDot');
  const ring=document.getElementById('cursorRing');
  if(dot&&ring&&window.innerWidth>768){
    let mx=0,my=0,rx=0,ry=0;
    document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
    (function anim(){
      rx+=(mx-rx)*.15;ry+=(my-ry)*.15;
      dot.style.left=mx+'px';dot.style.top=my+'px';
      ring.style.left=rx+'px';ring.style.top=ry+'px';
      requestAnimationFrame(anim);
    })();
    document.querySelectorAll('[data-hover]').forEach(el=>{
      el.addEventListener('mouseenter',()=>ring.classList.add('hovering'));
      el.addEventListener('mouseleave',()=>ring.classList.remove('hovering'));
    });
  }

  /* === SCROLL PROGRESS BAR === */
  const bar=document.querySelector('.scroll-progress');
  if(bar){
    window.addEventListener('scroll',()=>{
      const h=document.documentElement.scrollHeight-window.innerHeight;
      bar.style.width=(window.scrollY/h*100)+'%';
    },{passive:true});
  }

  /* === DARK / LIGHT TOGGLE === */
  const toggle=document.querySelector('.theme-toggle');
  if(toggle){
    const saved=localStorage.getItem('floza-theme');
    if(saved)document.documentElement.setAttribute('data-theme',saved);
    toggle.addEventListener('click',()=>{
      const cur=document.documentElement.getAttribute('data-theme');
      const next=cur==='light'?'dark':'light';
      document.documentElement.setAttribute('data-theme',next);
      localStorage.setItem('floza-theme',next);
      toggle.textContent=next==='light'?'🌙':'☀️';
    });
    // Set initial icon
    const cur=document.documentElement.getAttribute('data-theme');
    toggle.textContent=(cur==='light')?'🌙':'☀️';
  }

  /* === MOBILE NAV TOGGLE === */
  const navToggle=document.querySelector('.nav-toggle');
  const mobileMenu=document.querySelector('.mobile-menu');
  if(navToggle&&mobileMenu){
    navToggle.addEventListener('click',()=>{
      navToggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow=mobileMenu.classList.contains('open')?'hidden':'';
    });
    mobileMenu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click',()=>{
        navToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow='';
      });
    });
  }

  /* === SCROLL REVEAL === */
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}
    });
  },{threshold:.08,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

  /* === PARALLAX BLOBS ON SCROLL === */
  const blobs=document.querySelectorAll('.mesh-blob');
  window.addEventListener('scroll',()=>{
    const s=window.scrollY;
    blobs.forEach((b,i)=>{
      b.style.transform=`translateY(${s*0.03*(i+1)}px)`;
    });
  },{passive:true});

  /* === TILT ON HERO ORB === */
  const orb=document.querySelector('.orb-container');
  if(orb&&window.innerWidth>768){
    document.addEventListener('mousemove',e=>{
      const rect=orb.getBoundingClientRect();
      const cx=rect.left+rect.width/2;
      const cy=rect.top+rect.height/2;
      const dx=(e.clientX-cx)/rect.width;
      const dy=(e.clientY-cy)/rect.height;
      orb.style.transform=`rotateY(${dx*12}deg) rotateX(${-dy*12}deg)`;
    });
  }

  /* === MAGNETIC BUTTONS === */
  document.querySelectorAll('.btn-primary').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const rect=btn.getBoundingClientRect();
      const x=e.clientX-rect.left-rect.width/2;
      const y=e.clientY-rect.top-rect.height/2;
      btn.style.transform=`translate(${x*.15}px,${y*.15}px)`;
    });
    btn.addEventListener('mouseleave',()=>{btn.style.transform='';});
  });

  /* === SECTION TITLE SHIMMER === */
  document.querySelectorAll('.section-title').forEach(title=>{
    title.addEventListener('mouseenter',()=>{title.style.textShadow='0 0 40px rgba(84,104,224,0.15)';});
    title.addEventListener('mouseleave',()=>{title.style.textShadow='none';});
  });

  /* === ACTIVE NAV LINK ON SCROLL === */
  const sections=document.querySelectorAll('section[id]');
  if(sections.length){
    const navLinks=document.querySelectorAll('.navlinks a');
    window.addEventListener('scroll',()=>{
      let current='';
      sections.forEach(s=>{
        const top=s.offsetTop-200;
        if(window.scrollY>=top)current=s.getAttribute('id');
      });
      navLinks.forEach(a=>{
        a.classList.remove('active');
        if(a.getAttribute('href')==='#'+current)a.classList.add('active');
      });
    },{passive:true});
  }

  /* === PARTICLE RAIN === */
  const rainContainer=document.querySelector('.particle-rain');
  if(rainContainer){
    // Thin background drops
    for(let i=0;i<50;i++){
      const drop=document.createElement('div');
      drop.className='rain-drop';
      drop.style.left=Math.random()*100+'%';
      drop.style.height=(12+Math.random()*24)+'px';
      drop.style.animationDuration=(2.5+Math.random()*3.5)+'s';
      drop.style.animationDelay=Math.random()*8+'s';
      drop.style.opacity=(0.1+Math.random()*0.2);
      rainContainer.appendChild(drop);
    }
    // Glowing accent drops
    for(let i=0;i<18;i++){
      const drop=document.createElement('div');
      drop.className='rain-drop glow';
      drop.style.left=Math.random()*100+'%';
      drop.style.height=(30+Math.random()*50)+'px';
      drop.style.animationDuration=(4+Math.random()*5)+'s';
      drop.style.animationDelay=Math.random()*10+'s';
      drop.style.opacity=(0.3+Math.random()*0.4);
      rainContainer.appendChild(drop);
    }
    // Green "online" drops
    for(let i=0;i<8;i++){
      const drop=document.createElement('div');
      drop.className='rain-drop green';
      drop.style.left=Math.random()*100+'%';
      drop.style.height=(20+Math.random()*35)+'px';
      drop.style.animationDuration=(5+Math.random()*6)+'s';
      drop.style.animationDelay=Math.random()*12+'s';
      drop.style.opacity=(0.2+Math.random()*0.3);
      rainContainer.appendChild(drop);
    }
  }

  /* === FLOATING STATUS CARDS (Hero) === */
  document.querySelectorAll('.float-status').forEach(card=>{
    card.addEventListener('mouseenter',()=>{
      card.style.transform='translateY(-6px) scale(1.03)';
      card.style.boxShadow='0 8px 24px rgba(0,0,0,0.3)';
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform='';card.style.boxShadow='';
    });
  });

})();
