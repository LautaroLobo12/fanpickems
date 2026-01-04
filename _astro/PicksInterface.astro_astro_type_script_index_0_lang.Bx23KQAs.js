import{o as p,a as v}from"./firebase.D5b-2Piy.js";import{g,a as k,b as f,v as P,s as y}from"./picks-service.BjtwBU5s.js";import{e as n}from"./utils.BgDIg9OX.js";import"./firestore.XG-jrG-9.js";class S{state={tournament:null,teams:[],userPicks:null,currentUser:null,selectedPicks:{}};elements={container:document.getElementById("picks-interface"),loading:null,content:null,saveBtn:null,saveStatus:null};constructor(){this.init()}async init(){p(v,async e=>{this.state.currentUser=e,e?await this.loadTournamentData():this.showError("Please log in to make picks")})}async loadTournamentData(){try{this.showLoading();const e=await g();if(!e){this.showNoTournament();return}this.state.tournament=e,this.state.selectedPicks={},Object.keys(e.stages).forEach(s=>{this.state.selectedPicks[s]=[]});const a=await k(e.participatingTeams);if(this.state.teams=a,this.state.currentUser){const s=await f(e.id,this.state.currentUser.uid);this.state.userPicks=s,s&&s.picks&&(this.state.selectedPicks={...this.state.selectedPicks,...s.picks})}this.renderPicksInterface()}catch(e){console.error("Error loading tournament data:",e),this.showError("Failed to load tournament data. Please try again.")}}showLoading(){this.elements.container.innerHTML=`
      <div class="loading-picks">
        <div class="loading-spinner"></div>
        <p>Loading tournament picks...</p>
      </div>
    `}showError(e){this.elements.container.innerHTML=`
      <div class="error">
        <h3>Error</h3>
        <p>${n(e)}</p>
        <button onclick="location.reload()" class="retry-btn">Try Again</button>
      </div>
    `}showNoTournament(){this.elements.container.innerHTML=`
      <div class="no-tournament">
        <h3>No Active Tournament</h3>
        <p>There are currently no active tournaments available for picks.</p>
        <p>Check back later when a new tournament starts!</p>
      </div>
    `}renderPicksInterface(){if(!this.state.tournament||!this.state.teams.length){this.showError("Tournament data not available");return}const e=this.state.tournament,s=Object.entries(e.stages).sort(([,i],[,t])=>i.deadline.seconds-t.deadline.seconds).map(([i,t])=>{const c=new Date>new Date(t.deadline.seconds*1e3),r=t.maxPicks,o=t.pointValue,u=this.state.selectedPicks[i],l=Array.isArray(u)?u.length:u?1:0,d=l===r,h=t.description;let m="";return c?m='<span class="status-badge closed">Locked</span>':d?m='<span class="status-badge complete">Complete</span>':l>0?m='<span class="status-badge in-progress">In Progress</span>':m='<span class="status-badge open">Open</span>',`
        <div class="stage-section ${c?"stage-locked":""}">
          <div class="stage-header">
            <div class="header-top">
              <div class="stage-title-group">
                <h3>${n(this.formatStageName(i))}</h3>
                ${h?`<span class="stage-description">- ${n(h)}</span>`:""}
              </div>
              ${m}
            </div>
            <div class="stage-info">
              <span class="info-item"><i class="icon">📝</i> Pick ${r}</span>
              <span class="info-item"><i class="icon">💎</i> ${o} pts</span>
              <span class="info-item"><i class="icon">⏰</i> ${n(this.formatDeadline(t.deadline))}</span>
            </div>
            <div class="pick-progress-bar">
              <div class="progress-fill" style="width: ${l/r*100}%"></div>
            </div>
            <div class="pick-counter">
              ${l} / ${r} Selected
            </div>
          </div>
          
          <div class="teams-grid ${c?"disabled":""}" data-stage="${n(i)}" data-max-picks="${r}">
            ${this.renderTeamsForStage(i,c,t)}
          </div>
        </div>
      `}).join("");this.elements.container.innerHTML=`
      <div class="picks-content">
        <div class="tournament-header">
          <h2>${n(e.name)}</h2>
          ${e.description?`<p class="tournament-desc">${n(e.description)}</p>`:""}
          
          <div class="tournament-meta">
            <div class="tournament-dates">
              <span class="date-range">
                ${new Date(e.startDate.seconds*1e3).toLocaleDateString()} - 
                ${new Date(e.endDate.seconds*1e3).toLocaleDateString()}
              </span>
            </div>
            <div class="tournament-status">
              <span class="status-badge active">Active Tournament</span>
            </div>
          </div>
        </div>
        
        ${s}
        
        <div class="picks-actions">
          <button id="save-picks-btn" class="save-btn" ${this.canSavePicks()?"":"disabled"}>
            Save Picks
          </button>
          <div id="save-status" class="save-status"></div>
        </div>
      </div>
    `,this.bindEvents()}renderTeamsForStage(e,a,s){const i=s.allowedTeams&&s.allowedTeams.length>0?this.state.teams.filter(t=>s.allowedTeams.includes(t.id)):this.state.teams;return i.length===0?'<div style="grid-column: 1 / -1; text-align: center; color: #666; padding: 2rem;">No teams available for this stage yet.</div>':i.map(t=>{const c=this.state.selectedPicks[e],r=Array.isArray(c)?c.includes(t.id):c===t.id,o=t.name.substring(0,2).toUpperCase();return`
        <div class="team-card ${r?"selected":""} ${a?"disabled":""}" 
             data-team-id="${n(t.id)}" 
             data-stage="${n(e)}">
          <div class="selection-indicator">✓</div>
          <div class="team-logo-container">
            ${t.logo?`<img class="team-logo-img" src="${n(t.logo)}" alt="${n(t.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="team-logo-placeholder" style="display: none;">${n(o)}</div>`:`<div class="team-logo-placeholder random-bg">${n(o)}</div>`}
          </div>
          <div class="team-info">
            <div class="team-name team-name-full" title="${n(t.name)}">${n(t.name)}</div>
            <div class="team-name team-name-short" title="${n(t.name)}">${n(t.shortName||t.name.substring(0,3).toUpperCase())}</div>
          </div>
        </div>
      `}).join("")}bindEvents(){this.elements.container.addEventListener("click",a=>{const s=a.target.closest(".team-card");s&&!s.classList.contains("disabled")&&this.handleTeamSelection(s)});const e=document.getElementById("save-picks-btn");e&&e.addEventListener("click",()=>this.savePicks())}handleTeamSelection(e){const a=e.dataset.teamId,s=e.dataset.stage,i=e.parentElement,t=parseInt(i.dataset.maxPicks),c=this.state.selectedPicks[s]||[];if(e.classList.contains("selected")){e.classList.remove("selected");const o=c.indexOf(a);o>-1&&this.state.selectedPicks[s].splice(o,1)}else if(c.length<t)e.classList.add("selected"),this.state.selectedPicks[s].push(a);else{this.showSaveStatus(`You can only select ${t} teams for ${this.formatStageName(s)}`,"error");return}this.updatePickSummary(s),this.updateSaveButton()}updatePickSummary(e){const a=document.querySelector(`[data-stage="${e}"]`)?.closest(".stage-section");if(!a||!this.state.tournament)return;const s=a.querySelector(".pick-counter"),i=a.querySelector(".progress-fill"),t=a.querySelector(".header-top"),c=this.state.tournament.stages[e].maxPicks,r=this.state.selectedPicks[e],o=Array.isArray(r)?r.length:r?1:0,u=o===c;if(s&&(s.textContent=`${o} / ${c} Selected`),i&&(i.style.width=`${o/c*100}%`),t){const l=t.querySelector(".status-badge");l&&l.remove();let d="";u?d='<span class="status-badge complete">Complete</span>':o>0?d='<span class="status-badge in-progress">In Progress</span>':d='<span class="status-badge open">Open</span>',t.insertAdjacentHTML("beforeend",d)}}updateSaveButton(){const e=document.getElementById("save-picks-btn");e&&(e.disabled=!this.canSavePicks())}canSavePicks(){return!this.state.tournament||!this.state.currentUser?!1:Object.values(this.state.selectedPicks).some(e=>Array.isArray(e)&&e.length>0)}async savePicks(){if(!this.state.tournament||!this.state.currentUser)return;const e=document.getElementById("save-picks-btn"),a=e.textContent;try{e.disabled=!0,e.textContent="Saving...";const s=P(this.state.selectedPicks,this.state.tournament);if(!s.valid){this.showSaveStatus(s.errors.join(", "),"error");return}const i=!this.state.userPicks,t=await y(this.state.tournament.id,this.state.currentUser.uid,this.state.selectedPicks,i);t.success?this.showSaveStatus("Picks saved successfully!","success"):this.showSaveStatus(t.error||"Failed to save picks","error")}catch(s){console.error("Error saving picks:",s),this.showSaveStatus("Failed to save picks. Please try again.","error")}finally{e.disabled=!1,e.textContent=a}}showSaveStatus(e,a){const s=document.getElementById("save-status");s&&(s.innerHTML=`<div class="${n(a)}">${n(e)}</div>`,setTimeout(()=>{s.innerHTML=""},5e3))}formatStageName(e){return{playoffs:"Playoffs",playins:"Play-ins",semifinals:"Semifinals",finals:"Finals"}[e]||e}formatDeadline(e){const a=new Date(e.seconds*1e3);return a.toLocaleDateString()+" "+a.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}}document.addEventListener("DOMContentLoaded",()=>{new S});
