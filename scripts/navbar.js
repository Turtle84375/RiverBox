function insertNav(username) {
let adminPageLink;
if (admin == 'true') {
  // document.getElementById("navbar").style.backgroundColor = "#edc618";
  adminPageLink = `<span onclick="window.location.href = 'admin'">Tickets</span>`;
}else{
  adminPageLink = "";
}

let accountControls;
accountControls = `
<div id="accountControls">
<details id="accountDropdown">
    <summary style="list-style-type: none;cursor:pointer;">${username} &#8628;</summary>
    <div class="dropdown">
      <span onclick="viewUserPage('${username}')">Profile</span>
      <span onclick="dispatchPageLoad('settings')">Settings</span>
      <span onclick="dispatchPageLoad('messages')">Messages</span>
      <span onclick="logOut()">Log out</span>
    </div>
</details>
</div>
`;
if (username == "$") {
    loggedOut = true;
    accountControls = `
<div id="accountControls">
<span onclick="modal('adminlogin')">Log In</span>
<span onclick="dispatchPageLoad('signup')">Sign Up</span>
</div>
`;
}
document.getElementById("navbar").innerHTML = `
<div class="homeNavButtons" onclick="dispatchPageLoad('home')">
<img src="assets/logo.png">
RiverBox
</div>
<span onclick="dispatchPageLoad('explore')">Explore</span>
<span onclick="dispatchPageLoad('about')">About</span>
${adminPageLink}
${accountControls}
`;
}

function insertNavAdmin(username) {
let accountControls;
accountControls = `
<div id="accountControls" style="cursor:pointer">
  ${username}
</div>
`;

document.getElementById("navbar").innerHTML = `
<div class="homeNavButtons" onclick="document.location.href = '/'">
<img src="/assets/logo.png" id="adminLogo">
RiverBox
</div>
${accountControls}
`;

let deg = 0;
setInterval(function(){
    deg++;
    document.getElementById("adminLogo").style.filter = `hue-rotate(${deg}deg)`;
}, 1)
}