import{o as L,a as I}from"./firebase.D5b-2Piy.js";import{e as b}from"./firestore.XG-jrG-9.js";import{g as E}from"./picks-service.BjtwBU5s.js";import{e as T}from"./utils.BgDIg9OX.js";const w=async(r,n=5)=>{try{return await b(r,n)}catch(a){return console.error("Error getting leaderboard:",a),[]}},M=async(r,n)=>{try{const t=(await b(r,100)).findIndex(d=>d.uid===n);return t>=0?t+1:null}catch(a){return console.error("Error getting user rank:",a),null}},$=async(r,n,a=5)=>{try{const t=await w(r,a),d=await M(r,n);return{leaderboard:t,userRank:d,userInTop:t.some(l=>l.uid===n)}}catch(t){return console.error("Error getting leaderboard with user position:",t),{leaderboard:[],userRank:null,userInTop:!1}}};function B(){const r=document.getElementById("loading"),n=document.getElementById("leaderboard-content"),a=document.getElementById("error-message"),t=document.getElementById("tournament-name"),d=document.getElementById("leaderboard-list"),l=document.getElementById("user-position"),c=document.getElementById("user-rank-info");if(!r||!n||!a||!t||!d||!l||!c){console.error("One or more leaderboard elements are missing from the DOM.");return}let m=null;const s=(e,o)=>{e.style.display=o?"block":"none"},p=async()=>{try{s(r,!0),s(n,!1),s(a,!1);const e=await E();if(!e)throw new Error("No active tournament found");t.textContent=`${e.name} - Top 5`;const o=m?.uid,i=await $(e.id,o??"",5);y(i.leaderboard),o&&i.userRank&&f(i.userRank,i.userInTop),s(r,!1),s(n,!0)}catch(e){console.error("Error loading leaderboard:",e),s(r,!1),s(a,!0)}},y=e=>{if(e.length===0){d.innerHTML='<div class="no-data">No picks submitted yet</div>';return}const o=e.map((i,v)=>{const u=v+1,g=k(u),h=i.displayName||"Anonymous";return`
        <div class="leaderboard-entry ${u<=3?"top-three":""}">
          <div class="rank">
            ${g?`<span class="medal">${g}</span>`:`<span class="rank-number">${u}</span>`}
          </div>
          <div class="leaderboard-user-info">
            <span class="display-name">${T(h)}</span>
          </div>
          <div class="points">
            <span class="points-value">${i.totalPoints}</span>
            <span class="points-label">pts</span>
          </div>
        </div>
      `}).join("");d.innerHTML=o},f=(e,o)=>{o?c.innerHTML=`
        <div class="user-in-top">
          <span class="congrats">🎉 You're in the top 5!</span>
        </div>
      `:c.innerHTML=`
        <div class="user-rank">
          <span class="rank-text">Your rank: #${e}</span>
          <span class="encouragement">Keep predicting to climb the leaderboard!</span>
        </div>
      `,s(l,!0)},k=e=>{switch(e){case 1:return"🥇";case 2:return"🥈";case 3:return"🥉";default:return null}};L(I,e=>{m=e,p()}),setInterval(p,3e4)}B();
