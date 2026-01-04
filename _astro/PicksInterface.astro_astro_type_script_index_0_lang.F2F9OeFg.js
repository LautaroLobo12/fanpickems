import{o as h,a as p}from"./firebase.DTFJdJwj.js";import{g as v,a as g,b as k,v as f,s as P}from"./picks-service.7D95Q4Vp.js";import"./firestore.ClxTndq5.js";class y{state={tournament:null,teams:[],userPicks:null,currentUser:null,selectedPicks:{}};elements={container:document.getElementById("picks-interface"),loading:null,content:null,saveBtn:null,saveStatus:null};constructor(){this.init()}async init(){h(p,async e=>{this.state.currentUser=e,e?await this.loadTournamentData():this.showError("Please log in to make picks")})}async loadTournamentData(){try{this.showLoading();const e=await v();if(!e){this.showNoTournament();return}this.state.tournament=e,this.state.selectedPicks={},Object.keys(e.stages).forEach(s=>{this.state.selectedPicks[s]=[]});const a=await g(e.participatingTeams);if(this.state.teams=a,this.state.currentUser){const s=await k(e.id,this.state.currentUser.uid);this.state.userPicks=s,s&&s.picks&&(this.state.selectedPicks={...this.state.selectedPicks,...s.picks})}this.renderPicksInterface()}catch(e){console.error("Error loading tournament data:",e),this.showError("Failed to load tournament data. Please try again.")}}showLoading(){this.elements.container.innerHTML=`
      <div class="loading-picks">
        <div class="loading-spinner"></div>
        <p>Loading tournament picks...</p>
      </div>
    `}showError(e){this.elements.container.innerHTML=`
      <div class="error">
        <h3>Error</h3>
        <p>${e}</p>
        <button onclick="location.reload()" class="retry-btn">Try Again</button>
      </div>
    `}showNoTournament(){this.elements.container.innerHTML=`
      <div class="no-tournament">
        <h3>No Active Tournament</h3>
        <p>There are currently no active tournaments available for picks.</p>
        <p>Check back later when a new tournament starts!</p>
      </div>
    `}renderPicksInterface(){if(!this.state.tournament||!this.state.teams.length){this.showError("Tournament data not available");return}const e=this.state.tournament,s=Object.entries(e.stages).sort(([,n],[,t])=>n.deadline.seconds-t.deadline.seconds).map(([n,t])=>{const i=new Date>new Date(t.deadline.seconds*1e3),c=t.maxPicks,r=t.pointValue,d=this.state.selectedPicks[n],o=Array.isArray(d)?d.length:d?1:0,l=o===c,m=t.description;let u="";return i?u='<span class="status-badge closed">Locked</span>':l?u='<span class="status-badge complete">Complete</span>':o>0?u='<span class="status-badge in-progress">In Progress</span>':u='<span class="status-badge open">Open</span>',`
        <div class="stage-section ${i?"stage-locked":""}">
          <div class="stage-header">
            <div class="header-top">
              <div class="stage-title-group">
                <h3>${this.formatStageName(n)}</h3>
                ${m?`<span class="stage-description">- ${m}</span>`:""}
              </div>
              ${u}
            </div>
            <div class="stage-info">
              <span class="info-item"><i class="icon">📝</i> Pick ${c}</span>
              <span class="info-item"><i class="icon">💎</i> ${r} pts</span>
              <span class="info-item"><i class="icon">⏰</i> ${this.formatDeadline(t.deadline)}</span>
            </div>
            <div class="pick-progress-bar">
              <div class="progress-fill" style="width: ${o/c*100}%"></div>
            </div>
            <div class="pick-counter">
              ${o} / ${c} Selected
            </div>
          </div>
          
          <div class="teams-grid ${i?"disabled":""}" data-stage="${n}" data-max-picks="${c}">
            ${this.renderTeamsForStage(n,i,t)}
          </div>
        </div>
      `}).join("");this.elements.container.innerHTML=`
      <div class="picks-content">
        <div class="tournament-header">
          <h2>${e.name}</h2>
          ${e.description?`<p class="tournament-desc">${e.description}</p>`:""}
          
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
    `,this.bindEvents()}renderTeamsForStage(e,a,s){const n=s.allowedTeams&&s.allowedTeams.length>0?this.state.teams.filter(t=>s.allowedTeams.includes(t.id)):this.state.teams;return n.length===0?'<div style="grid-column: 1 / -1; text-align: center; color: #666; padding: 2rem;">No teams available for this stage yet.</div>':n.map(t=>{const i=this.state.selectedPicks[e],c=Array.isArray(i)?i.includes(t.id):i===t.id,r=t.name.substring(0,2).toUpperCase();return`
        <div class="team-card ${c?"selected":""} ${a?"disabled":""}" 
             data-team-id="${t.id}" 
             data-stage="${e}">
          <div class="selection-indicator">✓</div>
          <div class="team-logo-container">
            ${t.logo?`<img class="team-logo-img" src="${t.logo}" alt="${t.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="team-logo-placeholder" style="display: none;">${r}</div>`:`<div class="team-logo-placeholder random-bg">${r}</div>`}
          </div>
          <div class="team-info">
            <div class="team-name team-name-full" title="${t.name}">${t.name}</div>
            <div class="team-name team-name-short" title="${t.name}">${t.shortName||t.name.substring(0,3).toUpperCase()}</div>
          </div>
        </div>
      `}).join("")}bindEvents(){this.elements.container.addEventListener("click",a=>{const s=a.target.closest(".team-card");s&&!s.classList.contains("disabled")&&this.handleTeamSelection(s)});const e=document.getElementById("save-picks-btn");e&&e.addEventListener("click",()=>this.savePicks())}handleTeamSelection(e){const a=e.dataset.teamId,s=e.dataset.stage,n=e.parentElement,t=parseInt(n.dataset.maxPicks),i=this.state.selectedPicks[s]||[];if(e.classList.contains("selected")){e.classList.remove("selected");const r=i.indexOf(a);r>-1&&this.state.selectedPicks[s].splice(r,1)}else if(i.length<t)e.classList.add("selected"),this.state.selectedPicks[s].push(a);else{this.showSaveStatus(`You can only select ${t} teams for ${this.formatStageName(s)}`,"error");return}this.updatePickSummary(s),this.updateSaveButton()}updatePickSummary(e){const a=document.querySelector(`[data-stage="${e}"]`)?.closest(".stage-section");if(!a||!this.state.tournament)return;const s=a.querySelector(".pick-counter"),n=a.querySelector(".progress-fill"),t=a.querySelector(".header-top"),i=this.state.tournament.stages[e].maxPicks,c=this.state.selectedPicks[e],r=Array.isArray(c)?c.length:c?1:0,d=r===i;if(s&&(s.textContent=`${r} / ${i} Selected`),n&&(n.style.width=`${r/i*100}%`),t){const o=t.querySelector(".status-badge");o&&o.remove();let l="";d?l='<span class="status-badge complete">Complete</span>':r>0?l='<span class="status-badge in-progress">In Progress</span>':l='<span class="status-badge open">Open</span>',t.insertAdjacentHTML("beforeend",l)}}updateSaveButton(){const e=document.getElementById("save-picks-btn");e&&(e.disabled=!this.canSavePicks())}canSavePicks(){return!this.state.tournament||!this.state.currentUser?!1:Object.values(this.state.selectedPicks).some(e=>Array.isArray(e)&&e.length>0)}async savePicks(){if(!this.state.tournament||!this.state.currentUser)return;const e=document.getElementById("save-picks-btn"),a=e.textContent;try{e.disabled=!0,e.textContent="Saving...";const s=f(this.state.selectedPicks,this.state.tournament);if(!s.valid){this.showSaveStatus(s.errors.join(", "),"error");return}const n=await P(this.state.tournament.id,this.state.currentUser.uid,this.state.selectedPicks);n.success?this.showSaveStatus("Picks saved successfully!","success"):this.showSaveStatus(n.error||"Failed to save picks","error")}catch(s){console.error("Error saving picks:",s),this.showSaveStatus("Failed to save picks. Please try again.","error")}finally{e.disabled=!1,e.textContent=a}}showSaveStatus(e,a){const s=document.getElementById("save-status");s&&(s.innerHTML=`<div class="${a}">${e}</div>`,setTimeout(()=>{s.innerHTML=""},5e3))}formatStageName(e){return{playoffs:"Playoffs",playins:"Play-ins",semifinals:"Semifinals",finals:"Finals"}[e]||e}formatDeadline(e){const a=new Date(e.seconds*1e3);return a.toLocaleDateString()+" "+a.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}}document.addEventListener("DOMContentLoaded",()=>{new y});
