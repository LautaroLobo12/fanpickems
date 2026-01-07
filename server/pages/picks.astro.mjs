import { c as createComponent, m as maybeRenderHead, d as addAttribute, a as renderScript, b as renderTemplate, r as renderComponent } from '../chunks/astro/server_BncSQn_2.mjs';
import 'piccolore';
import { $ as $$AuthGuard } from '../chunks/AuthGuard_Z7WDc2Th.mjs';
import { $ as $$Navigation } from '../chunks/Navigation_CMGqBEZw.mjs';
import { $ as $$Image } from '../chunks/_astro_assets_CG3dKhMS.mjs';
import { getFirestore, collection, query, where, limit, getDocs, documentId } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
/* empty css                                 */
import { $ as $$Layout } from '../chunks/Layout_BZp-PQ8r.mjs';
export { renderers } from '../renderers.mjs';

const firebaseConfig = {
  apiKey: "AIzaSyCTHHKTzbWC51P0_Ow78o2gESNetQeqPwU",
  authDomain: "lck-pickems.firebaseapp.com",
  projectId: "lck-pickems",
  storageBucket: "lck-pickems.firebasestorage.app",
  messagingSenderId: "651788910244",
  appId: "1:651788910244:web:21497f900a23690424b031",
  measurementId: "G-7DN2JYRX2N"
};
const app = initializeApp(firebaseConfig);
getAuth(app);
const db = getFirestore(app);

const getActiveTournament = async () => {
  const tournamentsRef = collection(db, "tournaments");
  const q = query(tournamentsRef, where("active", "==", true), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};
const getTeamsByIds = async (teamIds) => {
  if (!teamIds || teamIds.length === 0) return [];
  const chunks = [];
  for (let i = 0; i < teamIds.length; i += 10) {
    chunks.push(teamIds.slice(i, i + 10));
  }
  const promises = chunks.map((chunk) => {
    const teamsRef = collection(db, "teams");
    const q = query(teamsRef, where(documentId(), "in", chunk));
    return getDocs(q);
  });
  const snapshots = await Promise.all(promises);
  const teams = [];
  snapshots.forEach((snap) => {
    snap.forEach((doc2) => {
      teams.push({ id: doc2.id, ...doc2.data() });
    });
  });
  return teams;
};

const getCurrentTournament = async () => {
  try {
    return await getActiveTournament();
  } catch (error) {
    console.error("Error getting active tournament:", error);
    return null;
  }
};
const getTeamsFromIds = async (teamIds) => {
  try {
    return await getTeamsByIds(teamIds);
  } catch (error) {
    console.error("Error getting teams by IDs:", error);
    return [];
  }
};

const bnkLogo = new Proxy({"src":"/_astro/bnk.D95Pn5gM.webp","width":5000,"height":5000,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/fanpickems/fanpickems/src/assets/logos/bnk.webp";
							}
							
							return target[name];
						}
					});

const brionLogo = new Proxy({"src":"/_astro/brion.BljOqawE.webp","width":5000,"height":5000,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/fanpickems/fanpickems/src/assets/logos/brion.webp";
							}
							
							return target[name];
						}
					});

const dkLogo = new Proxy({"src":"/_astro/dk.HKBjCCYF.webp","width":5000,"height":5000,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/fanpickems/fanpickems/src/assets/logos/dk.webp";
							}
							
							return target[name];
						}
					});

const dnsLogo = new Proxy({"src":"/_astro/dns.Nz5pcv06.webp","width":5000,"height":5000,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/fanpickems/fanpickems/src/assets/logos/dns.webp";
							}
							
							return target[name];
						}
					});

const drxLogo = new Proxy({"src":"/_astro/drx.CJ7by1sU.webp","width":5000,"height":5000,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/fanpickems/fanpickems/src/assets/logos/drx.webp";
							}
							
							return target[name];
						}
					});

const gengLogo = new Proxy({"src":"/_astro/geng.C1_FtW3b.webp","width":7289,"height":7289,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/fanpickems/fanpickems/src/assets/logos/geng.webp";
							}
							
							return target[name];
						}
					});

const hleLogo = new Proxy({"src":"/_astro/hle.DXg0lPuI.webp","width":5000,"height":5000,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/fanpickems/fanpickems/src/assets/logos/hle.webp";
							}
							
							return target[name];
						}
					});

const ktLogo = new Proxy({"src":"/_astro/kt.CNHqCkyP.webp","width":848,"height":848,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/fanpickems/fanpickems/src/assets/logos/kt.webp";
							}
							
							return target[name];
						}
					});

const nsLogo = new Proxy({"src":"/_astro/ns.CfiVc1_e.webp","width":860,"height":860,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/fanpickems/fanpickems/src/assets/logos/ns.webp";
							}
							
							return target[name];
						}
					});

const t1Logo = new Proxy({"src":"/_astro/t1.CaoFGzD9.webp","width":5000,"height":5000,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/fanpickems/fanpickems/src/assets/logos/t1.webp";
							}
							
							return target[name];
						}
					});

const $$PicksInterface = createComponent(async ($$result, $$props, $$slots) => {
  const logoMap = {
    bnk: bnkLogo,
    brion: brionLogo,
    dk: dkLogo,
    dns: dnsLogo,
    drx: drxLogo,
    geng: gengLogo,
    hle: hleLogo,
    kt: ktLogo,
    ns: nsLogo,
    t1: t1Logo
  };
  const tournament = await getCurrentTournament();
  let teams = [];
  let initialSelectedPicks = {};
  let currentUserUid = null;
  getAuth();
  getFirestore();
  if (tournament) {
    teams = await getTeamsFromIds(tournament.participatingTeams);
  }
  const formatStageName = (stageName) => {
    const names = {
      playoffs: "Playoffs",
      playins: "Play-ins",
      semifinals: "Semifinals",
      finals: "Finals"
    };
    return names[stageName] || stageName;
  };
  const formatDeadline = (deadline) => {
    const date = new Date(deadline.seconds * 1e3);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const escapeHtml = (str) => {
    if (typeof str !== "string") return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  };
  return renderTemplate`${maybeRenderHead()}<div class="picks-interface" id="picks-interface"${addAttribute(JSON.stringify(tournament), "data-tournament")}${addAttribute(JSON.stringify(teams), "data-teams")}${addAttribute(JSON.stringify(initialSelectedPicks), "data-initial-picks")}${addAttribute(currentUserUid, "data-current-user-uid")}> ${!tournament ? renderTemplate`<div class="no-tournament"> <h3>No Active Tournament</h3> <p>There are currently no active tournaments available for picks.</p> <p>Check back later when a new tournament starts!</p> </div>` : renderTemplate`<div class="picks-content"> <div class="tournament-header"> <h2>${tournament.name}</h2> ${tournament.description && renderTemplate`<p class="tournament-desc">${tournament.description}</p>`} <div class="tournament-meta"> <div class="tournament-dates"> <span class="date-range"> ${new Date(
    tournament.startDate.seconds * 1e3
  ).toLocaleDateString()}${" "}
-
${new Date(
    tournament.endDate.seconds * 1e3
  ).toLocaleDateString()} </span> </div> <div class="tournament-status"> <span class="status-badge active">Active Tournament</span> </div> </div> </div> ${Object.entries(tournament.stages).sort(([, a], [, b]) => a.deadline.seconds - b.deadline.seconds).map(([stageName, stageConfig]) => {
    const isDeadlinePassed = /* @__PURE__ */ new Date() > new Date(stageConfig.deadline.seconds * 1e3);
    const maxPicks = stageConfig.maxPicks;
    const pointValue = stageConfig.pointValue;
    const currentPicks = initialSelectedPicks[stageName] || [];
    const currentPickCount = currentPicks.length;
    const isComplete = currentPickCount === maxPicks;
    const description = stageConfig.description;
    let statusBadgeClass = "";
    let statusBadgeText = "";
    if (isDeadlinePassed) {
      statusBadgeClass = "closed";
      statusBadgeText = "Locked";
    } else if (isComplete) {
      statusBadgeClass = "complete";
      statusBadgeText = "Complete";
    } else if (currentPickCount > 0) {
      statusBadgeClass = "in-progress";
      statusBadgeText = "In Progress";
    } else {
      statusBadgeClass = "open";
      statusBadgeText = "Open";
    }
    const teamsToDisplay = stageConfig.allowedTeams && stageConfig.allowedTeams.length > 0 ? teams.filter(
      (team) => stageConfig.allowedTeams.includes(team.id)
    ) : teams;
    return renderTemplate`<div${addAttribute(`stage-section ${isDeadlinePassed ? "stage-locked" : ""}`, "class")}${addAttribute(escapeHtml(stageName), "data-stage-name")}> <div class="stage-header"> <div class="header-top"> <div class="stage-title-group"> <h3>${formatStageName(stageName)}</h3> ${description && renderTemplate`<span class="stage-description">- ${description}</span>`} </div> <span${addAttribute(`status-badge ${statusBadgeClass}`, "class")}> ${statusBadgeText} </span> </div> <div class="stage-info"> <span class="info-item"> <i class="icon">📝</i> Pick ${maxPicks} </span> <span class="info-item"> <i class="icon">💎</i> ${pointValue} pts
</span> <span class="info-item"> <i class="icon">⏰</i>${" "} ${formatDeadline(stageConfig.deadline)} </span> </div> <div class="pick-progress-bar"> <div class="progress-fill"${addAttribute(`width: ${currentPickCount / maxPicks * 100}%`, "style")}></div> </div> <div class="pick-counter"> ${currentPickCount} / ${maxPicks} Selected
</div> </div> <div${addAttribute(`teams-grid ${"disabled" }`, "class")}${addAttribute(stageName, "data-stage")}${addAttribute(maxPicks, "data-max-picks")}> ${teamsToDisplay.length === 0 ? renderTemplate`<div style="grid-column: 1 / -1; text-align: center; color: #666; padding: 2rem;">
No teams available for this stage yet.
</div>` : teamsToDisplay.map((team) => {
      const isSelected = currentPicks.includes(team.id);
      const initials = team.name.substring(0, 2).toUpperCase();
      return renderTemplate`<div${addAttribute(`team-card ${isSelected ? "selected" : ""} ${"disabled" }`, "class")}${addAttribute(escapeHtml(team.id), "data-team-id")}${addAttribute(escapeHtml(stageName), "data-stage")}> <div class="selection-indicator">✓</div> <div class="team-logo-container"> ${logoMap[team.id] ? renderTemplate`${renderComponent($$result, "Image", $$Image, { "src": logoMap[team.id], "alt": team.name, "width": 40, "height": 40, "loading": "lazy", "decoding": "async", "class": "team-logo-img" })}` : renderTemplate`<div class="team-logo-placeholder random-bg"> ${initials} </div>`} </div> <div class="team-info"> <div class="team-name team-name-full"${addAttribute(team.name, "title")}> ${team.name} </div> <div class="team-name team-name-short"${addAttribute(team.name, "title")}> ${team.shortName || team.name.substring(0, 3).toUpperCase()} </div> </div> </div>`;
    })} </div> </div>`;
  })} <div class="picks-actions"> <button id="save-picks-btn" class="save-btn"${addAttribute(
    !currentUserUid,
    "disabled"
  )}>
Save Picks
</button> <div id="save-status" class="save-status"></div> </div> </div>`} </div> ${renderScript($$result, "/home/runner/work/fanpickems/fanpickems/src/components/PicksInterface/PicksInterface.astro?astro&type=script&index=0&lang.ts")} `;
}, "/home/runner/work/fanpickems/fanpickems/src/components/PicksInterface/PicksInterface.astro", void 0);

const $$Picks = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "LCK Pickems - Make Your Picks", "data-astro-cid-5izx6456": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AuthGuard", $$AuthGuard, { "data-astro-cid-5izx6456": true }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "Navigation", $$Navigation, { "data-astro-cid-5izx6456": true })} ${maybeRenderHead()}<div class="picks-page" data-astro-cid-5izx6456> <div class="picks-container" data-astro-cid-5izx6456> <div class="page-header" data-astro-cid-5izx6456> <h1 data-astro-cid-5izx6456>Tournament Picks</h1> <p class="page-description" data-astro-cid-5izx6456>
Select teams for each tournament stage to earn points
</p> </div> ${renderComponent($$result3, "PicksInterface", $$PicksInterface, { "data-astro-cid-5izx6456": true })} </div> </div> ` })} ` })} `;
}, "/home/runner/work/fanpickems/fanpickems/src/pages/picks.astro", void 0);

const $$file = "/home/runner/work/fanpickems/fanpickems/src/pages/picks.astro";
const $$url = "/picks";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Picks,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
