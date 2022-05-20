let apiPath = "https://riverbox-api.turtle84375.repl.co/";
let lastSelectedPostReportID;
let lastbanneduserattempt;
let lastcommunityfetched;
let lastUserPageVisited;
let recommendThisUser;
let lastPageVisited;
let lastfetcheduser;
let attachements;
let lastcomedit;
let loadTimeout;
let replyPostId;
let betaOrigin;
let loggedOut;
let redirect;
let accowner;
let version;
let lastpin;
let logged;
let admin;
let state;
let x0;

state = {"origin": true, "session": {"username": ""}};
let typesOfPosts = ["afterBegin", "beforeEnd"];
let following = ["lanksy", "eee"];
attachements = [];
redirect = false;

let awardsList = {
    "1": "awards/bronzemedal.png",
    "2": "awards/silvermedal.png",
    "3": "awards/goldmedal.png",
    "4": "awards/bronzetrophy.png",
    "5": "awards/silvertrophy.png",
    "6": "awards/goldtrophy.png",
    "7": "awards/diamondaward.png",
}

betaOrigin = location.hostname.endsWith('dev.riverbox.ml');
logged = localStorage.getItem("username") != null && localStorage.getItem("session") != null;

if (betaOrigin) {
  version = "Private";
}else{
  version = "Public";
}

function updateState() {
  fetch(apiPath)
     .then(response => response.json())
     .then(data => dispatchState(data))
}

updateState()

function dispatchState(flags) {
  if (flags.maintenance /* && !betaOrigin */) {
    document.body.innerHTML = `<h1 style="padding-left:20px">503 Maintenance</h1>`;
  }
  state.flags = flags;
}

if (ipExpActivated && localStorage.getItem("ip") == null) {
  modal("ipconfirm");
  localStorage.setItem("ip", true);
}

if (logged) {
dispatchLoadingScreen();
fetch(apiPath + "signin/" + localStorage.getItem("username") + "/" + localStorage.getItem("session"))
   .then(response => response.json())
   .then(data => computeLoginData(data))
}else{
insertNav("$");
dispatchPageLoad("home");
}

var pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
var current = 0;
var keyHandler = function (event) {

	if (pattern.indexOf(event.key) < 0 || event.key !== pattern[current]) {
		current = 0;
		return;
	}

	current++;
	if (pattern.length === current) {
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
	}

};
document.addEventListener('keydown', keyHandler, false);

function newmsgcheck(data, alert) {
if (data.newmessages) {
  if (alert) {
    $("#pageContent").effect("shake");
    setTimeout(function(){
        modal("", `You have incoming messages! <span class="link" onclick="dispatchPageLoad('messages');closeModal();">Click to view your messages page</span>.`, "dismissMsg()");
    }, 500)
  }else{
    document.body.insertAdjacentHTML("beforeEnd", `
    <div id="newmsg">You have a new message!</div>
    `);
  }
}
}

function computeLoginData(data) {
    if (data.success == "true") {
    state.session = data;
    if (data.banned) {
      modal("bannedbeta");
      document.getElementById("banreason").innerText = data.bannedreason;
      document.getElementById("pageContent").remove();
      document.getElementById("navbar").remove();
      localStorage.clear();
    }else{
      newmsgcheck(data, true);
      admin = data.admin;
      insertNav(data.username);
    }
    if (redirect) {
      if (state.session.username.toLowerCase() == "zu-" || state.session.username.toLowerCase() == "radi8" || state.session.username.toLowerCase() == "lanksy") {
        window.location.href = "https://admintalk.riverbox.ml/";
      }
    }
    }else{
      insertNav("$")
      localStorage.clear();
      logged = false;
    }
    dispatchPageLoad("home")
    loadAdminTools();
}

function disablecbm(bannersrc) {
document.body.style.backgroundImage = "url(https://u.cubeupload.com/Turtle84375/AO6OiZ.png)";
document.body.style.backgroundSize = null;
document.getElementById("navbar").style.backgroundColor = null;
if (bannersrc != null) {
  document.getElementById("banner").outerHTML = `<img src="` + bannersrc.replaceAll("<", "&lt;").replaceAll(">", "&gt;") + `" style="object-fit: cover;width: 100%;height: 30vh;object-position: 50% 50%;opacity: 0.8" id="banner">`;
}
}

function dispatchLoadingScreen() {
document.getElementById("pageContent").innerHTML = `<div class="loader"></div><br><span class="header">Give us a moment...</span>`;
document.getElementById("pageContent").style.paddingTop = "80px";
}

function dispatchPageLoad(pageType, doNotSetTitle) {
  updateState();
  dispatchLoadingScreen();
  lastPageVisited = pageType;
  if (pageTypes[pageType] != null) {
    disablecbm();
    if (document.getElementById("accountDropdown") != null) {
      document.getElementById("accountDropdown").removeAttribute("open");
    }   
    
    if (document.getElementById("adminDropdown") != null) {
      document.getElementById("adminDropdown").removeAttribute("open");
    }
    
    if (pageTypes[pageType].banner == "") {
      document.getElementsByClassName("banner")[0].style.display = "none";
    }else{
      document.getElementsByClassName("banner")[0].style.display = "block";
      document.getElementsByClassName("banner")[0].innerText = pageTypes[pageType].banner;
    }
    
    if (pageTypes[pageType].accountonly == true && loggedOut == true) {
    clearTimeout(loadTimeout);
  }else{
    if (!doNotSetTitle) {
      dispatchDocumentTitle(pageTypes[pageType].title);
    }
    if (pageTypes[pageType].padding) {
      document.getElementById("pageContent").style.paddingTop = "10px";
    }else{
      document.getElementById("pageContent").style.paddingTop = null;
    }
      $('#pageContent').hide();
      $('#pageContent').show("fade");
      document.getElementById("pageContent").innerHTML = pageTypes[pageType].content;
      eval(pageTypes[pageType].script);
  }
    }
}

function dispatchDocumentTitle(title, disbaleRiverBoxBranding) {
  if (disbaleRiverBoxBranding) {
    document.title = title;
  }else{
    document.title = title + " - RiverBox";
  }
}

function initLoadPosts(){
fetch(apiPath + "latestposts")
  .then(response => response.json())
  .then(data => loadPosts(data, false))
}

function loadPosts(x, disableReplies) {
var postKeys = Object.keys(x);
updateRecommandations();

let b;
let tooManyRepliesModal;
for(let i = postKeys.length; i > 0; i--) {
data = postKeys[i - 1];
b = "";

if (!disableReplies) {
if (x[data].replies[0] != null) {
  for (let i = 0;i < Object.keys(x[data].replies).length;i++)
    b = b + `<div class="post reply"><span style="color: var(--secondaryfont);cursor:pointer" onclick="viewUserPage('` + x[data].replies[i].author + `')">` + x[data].replies[i].author + `</span><span style="margin-top:7px;margin-bottom:7px;display:block;color:var(--postfont)">` + convertPost(x[data].replies[i].reply) + `</span>
<div style="float: right;color: var(--secondaryfont);">` + moment(x[data].replies[i].timestamp) + `</div>
</div><br>`
}

tooManyRepliesModal = "replyModal(";
if (Object.keys(x[data].replies).length > 9) {
  tooManyRepliesModal = "modal('repliesoverloadalert', ";
}
}else{
tooManyRepliesModal = "modal('repliesoverloadalert', ";
}

let chacne = Math.floor(Math.random() * 4) == 0;
let addPost;

if (x[data].author.toLowerCase() == state.session.username.toLowerCase() || recommendThisUser == "unless?<>") {
addPost = true;
}else{
if (x[data].author.toLowerCase() != recommendThisUser) {
if (chacne) {
addPost = true;
}else{
addPost = false;
}
}else{
addPost = true;
}
}

if (addPost) {
x0 = typesOfPosts[Math.floor(Math.random() * typesOfPosts.length)];
document.getElementById("postshomex_").insertAdjacentHTML(x0, `<div class="post"><span style="color: var(--secondaryfont);cursor:pointer" onclick="viewUserPage('` + x[data].author + `')"> <img id="img${i}" src="pfps/question mark.png" style="width: 30px;height:30px;border-radius:30px;vertical-align: middle;" /> ` + x[data].author + `</span><span style="margin-top:7px;margin-bottom:7px;display:block;color:var(--postfont)">` + convertPost(x[data].content) + `</span><img src="` + x[data].attchmnt + `" class="attachement" onerror="this.remove()" /><br><span onclick="${tooManyRepliesModal}${i})" class="socialButton" ` + loggedSocial() + `>Reply</span> <span onclick="reportModal(${i})" class="socialButton" ` + loggedSocial() + `>Report</span>
<div ` + adminClassLoad() + `><span class="socialButton" onclick="modPost(${i})">(Moderate)</span> <span class="socialButton">(ID: ${i})</span></div>
<div style="float: right;color: var(--secondaryfont);">` + moment(x[data].timestamp) + `</div></div><br>` + b + `<br>`);
postData(apiPath + 'postpfp', JSON.parse(`{"postid": "${i}"}`))
  .then(data => {
    document.getElementById(`img${i}`).setAttribute("src", data.pfp);
  });
}
}
}

function convertPost(postContent) {
  if (postContent == "<span class='moderated-post-text'>(This post was moderated)</span>") {
    return postContent;
  }else{
    return atob(postContent).replaceAll("[b]", `<b>`).replaceAll("[/b]", `</b>`).replaceAll("[i]", `<i>`).replaceAll("[/i]", `</i>`).replaceAll("[u]", `<u>`).replaceAll("[/u]", `</u>`).replaceAll("[s]", `<s>`).replaceAll("[/s]", `</s>`).replaceAll("&&br&&", "<br>");
  }
}

function loggedSocial() {
  if (!logged) {
    return "style='display:none'";
  }else{
    return "";
  }
}

function adminClassLoad(){
  if(admin == 'true') {
    return "style='display: inline-block !important'";
  }else{
    return "style='display: none !important'";
  }
}

// Example POST method implementation:
async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

const signUp = () => {
  let usernameInput = document.getElementById("usernameInput").value;
  let sessionInput = document.getElementById("sessionInput").value;
  if(usernameInput.includes("/") || usernameInput.includes("#") || usernameInput.includes("?") || usernameInput.includes("%") || usernameInput.includes(">") || usernameInput.includes("<") || usernameInput == "" || sessionInput == "") {
    document.getElementById("usernameInput").value = "";
    document.getElementById("sessionInput").value = "";
    modal("", "Invalid username or password!")
  }else{
postData(apiPath + 'signup', JSON.parse(`{"username": "${usernameInput}", "session": "${sessionInput}"}`))
  .then(data => {
    setTimeout(function(){
      if (data.success == 'false') {
        document.getElementById("signup-error").innerText = data.error;
      }else{
        logIn(data);
        modal("welcome");
      }
    }, 1000)
  });
  }
}

function logIn(data) {
  if (data.success == false) {
    modal("", "Error: " + data.error)
  }else{
    localStorage.setItem("username", data.username);
    localStorage.setItem("session", data.session);
  }
}

function logOut() {
  localStorage.clear();
  window.location.reload();
}

function post() {
  if (logged) {
    attachements = [];
    modal("postprompt");
  }else{
    dispatchPageLoad("signup");
  }
}

function sendPost(postContent) {
  postContent = postContent.replace(/[\r\n]+/g,"&&br&&");
  if (postContent != '') {
    console.log(postContent.replaceAll(/(?:\r\n|\r|\n)/gi, "\n"));
    loadFull();
    closeModal();
    postContent = postContent.replaceAll(/(?:\r\n|\r|\n)/gi, "\n");
    postData(apiPath + 'post', JSON.parse(`{"post": "${postContent}", "username": "` + localStorage.getItem("username") + `", "session": "` + localStorage.getItem("session") + `", "attchmnt": "` + attachements.toString() + `"}`))
      .then(data => {
        attachements = [];
        window.location.reload();
      });
  }
}

// function likePost(e, postId) {
// let before = e.innerText.replace(/\D/g, "");
// let newCount = parseInt(before) + 1;
// e.innerText = "Liked (...)";
// e.style.fontDecoration = null;
// e.style.cursor = null;
// postData('https://riverbox-api.turtle84375.repl.co/like', JSON.parse(`{"username": "` + localStorage.getItem("username") + `", "session": "` + localStorage.getItem("session") + `", "post": "${postId}"}`))
//   .then(data => {
//     if (data.success) {
//       e.innerText = "Liked (" + newCount.toString() + ")";
//     }else{
//       e.innerText = "Liked (" + before + ")";
//     }
//   });
// }

function reply(postId, reply) {
  loadFull();
  closeModal();
  postData(apiPath + 'reply', JSON.parse(`{"post": "${postId}", "username": "` + localStorage.getItem("username") + `", "session": "` + localStorage.getItem("session") + `", "reply": "${reply}"}`))
  .then(data => {
      window.location.reload();
  });
}

function replyModal(postId) {
  replyPostId = postId;
  modal("replyprompt");
}

function reportModal(postId) {
  lastSelectedPostReportID = postId;
  modal('reportprompt');
}

function report(postId, reason, disablemodal) {
    postData(apiPath + 'report', JSON.parse(`{"username": "` + localStorage.getItem("username") + `", "session": "` + localStorage.getItem("session") + `", "postid": "${postId}", "reason": "${reason}"}`))
    .then(data => {
      if (disablemodal != true) {
        modal("reportsuccess");
      }
    });
}

function changeSession(newSession) {
loadFull();
postData(apiPath + 'changesession', JSON.parse(`{"newsession": "${newSession}", "username": "` + localStorage.getItem("username") + `", "session": "` + localStorage.getItem("session") + `"}`))
  .then(data => {
    window.location.reload();
  });
}

function loadMessages() {
  postData(apiPath + 'messages', {"username": localStorage.getItem("username"), "session": localStorage.getItem("session")})
  .then(data => {
    document.getElementById("pageContent").innerHTML = "<h1>Messages</h1><div id='msgs'></div>";
    for (let i = 0;i < Object.keys(data).length;i++) {
      document.getElementById("msgs").insertAdjacentHTML("afterBegin", `<div class="messageitem">` + data[i].content.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("space&&", "<br>") + `<br><br><span style="color: #919191;">` + moment(data[i].timestamp) + `</span></div><br>`);
    }
  });
}

function dismissMsg() {
  postData(apiPath + 'messages', {"username": localStorage.getItem("username"), "session": localStorage.getItem("session")})
  .then(data => {
  });
}

setInterval(function(){
fetch(apiPath + "signin/" + localStorage.getItem("username") + "/" + localStorage.getItem("session"))
   .then(response => response.json())
   .then(data => newmsgcheck(data, true))
}, 10000)

function loadFull() {
  $('body').css("pointerEvents","none");
  $("#version").hide("fade");
  $("#navbar").hide("fade");
  $(".post-button").hide("fade");
  document.getElementById("pageContent").innerText = "Loading...";
}

function socialMediaAttach() {
  modal("", `
  <select id="social">
  <option value="yt">YouTube</option>
  <option value="wo">WasteOf</option>
  <option value="tt">Twitter</option>
  <option value="gh">Github</option>
  <option value="fb">FaceBook</option>
  <option value="sh">Scratch</option>
  </select> <input id="url" placeholder="URL to your account..." /><br><br><button class="highlightedButton" onclick="applySocial(document.getElementById('social').value, document.getElementById('url').value)">Apply!</button> <button onclick="closeModal()">Nevermind...</button>`, "", "Add social media...", false)
}

function applySocial(social, url) {
  closeModal();
  loadFull();
}

function requestaward(awardtype) {
let statex = {};
statex.username = state.session.username;
statex.admin = state.session.admin;
statex.awards = state.session.awards;

report("-!", localStorage.getItem("username") + `/${awardtype}<<<<` + JSON.stringify(statex).replaceAll("{", "").replaceAll("}", "").replaceAll(`"`, "'") + "AUTOMATED REPORT - DO NOT MODERATE - LEAVE LANKSY TO MANAGE", true);
}

function recommendUser1(user) {
  localStorage.setItem('recommendthisuser', user);
  modal('', "Thanks for your feedback, this user's posts will now be more commonly recommended to you.");
}

function visualJSON(x) {
modal("", "<ul id='ul'></ul>", "", "JSON Keys");
for(let i = 0;i < Object.keys(x).length;i++) {
    document.getElementById("ul").insertAdjacentHTML("beforeEnd", `<li><span style="font-size:20px">${Object.keys(x)[i]}</span><br>"${x[Object.keys(x)[i]]}"</li> `);
}
}

function visualJSONStandalone(x) {
for(let i = 0;i < Object.keys(x).length;i++) {
    document.getElementById("ul").insertAdjacentHTML("afterBegin", `<details><summary>${Object.keys(x)[i]}</summary>${x[Object.keys(x)[i]]}</details>`);
}
}

function modPost(postId) {
postData(apiPath + 'remove', JSON.parse(`{"post": "${postId}", "username": "localStorage.getItem("username")", "session": "localStorage.getItem("session")"}`))
  .then(data => {
      window.location.reload();
  });
}
