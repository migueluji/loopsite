window.onload = () => {
    gapiLoaded();
    gisLoaded()
}

var CLIENT_ID = '129246923501-4lk4rkmhin21kcaoul91k300s9ar9n1t.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCfXON-94Onk-fLyihh8buKZcFIjynGRTc';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive'; // access only to files created by the application
var signinButton = document.getElementsByClassName('signin')[0];
var signoutButton = document.getElementsByClassName('signout')[0];
let tokenClient;
let gapiInited = false;
let gisInited = false;
let gameNumber = 0;

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: ''
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        signinButton.style.display = 'block';
    }
}

signinButton.onclick = () => handleAuthClick() // Sign in
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        signinButton.style.display = 'none';
        signoutButton.style.display = 'block';
        checkFolder();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

signoutButton.onclick = () => handleSignoutClick() // Sign out
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        signinButton.style.display = 'block'
        signoutButton.style.display = 'none'
    }
}

// check for a "Loop Games" folder in google drive
function checkFolder() {
    gapi.client.drive.files.list({
        'q': 'name = "Loop Games"',
    }).then(function (response) {
        var files = response.result.files;
        if (files && files.length > 0) {
            //for (var i = 0; i < files.length; i++) {
            //    var file = files[0];
            localStorage.setItem('games_folder', files[0].id);
            // get files if folder available
            showList();
            // }
        } else { // if folder not available then create
            createFolder();
        }
    })
}

function editGame(game) {
    var id = game.getAttribute('data-id');
    var name = game.getAttribute('data-name');
    localStorage.setItem("gameId", id);
    localStorage.setItem("gameName", name);
    localStorage.setItem("token", JSON.stringify(gapi.client.getToken()));
    window.open("editor/", "_blank");
}
// now create a function to upload file
function save() {
    // get parent folder id from localstorage
    const gamesFolder = localStorage.getItem('games_folder');
    // set file metadata
    var metadata = {
        name: "game" + gameNumber.toString(),
        //mimeType: 'plain/text',
        mimeType: 'application/vnd.google-apps.folder'
        //parents: [gamesFolder]
    };
    var formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    // formData.append("file", blob);
    fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: 'POST',
        headers: new Headers({ "Authorization": "Bearer " + gapi.auth.getToken().access_token }),
        body: formData
    }).then(response => response.json())
        .then(value => {
            // also update list on file upload
            showList();
        });
}

function createFolder() {
    var access_token = gapi.auth.getToken().access_token;
    var request = gapi.client.request({
        'path': 'drive/v2/files',
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token,
        },
        'body': {
            'title': 'Loop Games',
            'mimeType': 'application/vnd.google-apps.folder'
        }
    });
    request.execute(function (response) {
        localStorage.setItem('games_folder', response.id);
    })
}

var expandContainer = document.querySelector('.expand-container');
var expandContainerUl = document.querySelector('.expand-container ul');
var listcontainer = document.querySelector('.list ul');
// create a function to show hide options
function expand(v) {
    var click_position = v.getBoundingClientRect();
    if (expandContainer.style.display == 'block') {
        expandContainer.style.display = 'none';
        expandContainerUl.setAttribute('data-id', '');
        expandContainerUl.setAttribute('data-name', '');
    } else {
        expandContainer.style.display = 'block';
        expandContainer.style.left = (click_position.left + window.scrollX) - 120 + 'px';
        expandContainer.style.top = (click_position.top + window.scrollY) + 25 + 'px';
        // get data name & id and store it to the options
        expandContainerUl.setAttribute('data-id', v.parentElement.getAttribute('data-id'));
        expandContainerUl.setAttribute('data-name', v.parentElement.getAttribute('data-name'));
    }
}

// function for files list
function showList() {
    gapi.client.drive.files.list({
        'q': `parents in "${localStorage.getItem('games_folder')}"`// get parent folder id from localstorage
    }).then(function (response) {
        var files = response.result.files;
        if (files && files.length > 0) {
            listcontainer.innerHTML = '';
            gameNumber = files.length;
            for (var i = 0; i < files.length; i++) {
                listcontainer.innerHTML += `
                <li onclick=editGame(this) data-id="${files[i].id}" data-name="${files[i].name}">
                    <span>${files[i].name}</span>
                    <svg onclick="expand(this)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
                </li>`;
            }
        } else {
            listcontainer.innerHTML = '<div style="text-align: center;">No Files</div>'
        }
    })
}

function readEditDownload(v, condition) {
    var id = v.parentElement.getAttribute('data-id');
    var name = v.parentElement.getAttribute('data-name');
    v.innerHTML = '...';
    gapi.client.drive.files.get({
        fileId: id,
        alt: 'media'
    }).then(function (res) {
        expandContainer.style.display = 'none';
        expandContainerUl.setAttribute('data-id', '');
        expandContainerUl.setAttribute('data-name', '');
        if (condition == 'read') {
            v.innerHTML = 'Read';
            document.querySelector('textarea').value = res.body;
            document.documentElement.scrollTop = 0;
            console.log('Read Now')
        } else if (condition == 'edit') {
            v.innerHTML = 'Edit';
            document.querySelector('textarea').value = res.body;
            document.documentElement.scrollTop = 0;
            var updateBtn = document.getElementsByClassName('upload')[0];
            updateBtn.innerHTML = 'Update';
            // we will make the update function later
            updateBtn.setAttribute('onClick', 'update()');
            document.querySelector('textarea').setAttribute('data-update-id', id);
            console.log('File ready for update');
        } else {
            v.innerHTML = 'Download';
            var blob = new Blob([res.body], { type: 'plain/text' });
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = name;
            a.click();
        }
    })
}

// new create update function
function update() {
    var updateId = document.querySelector('textarea').getAttribute('data-update-id');
    var url = 'https://www.googleapis.com/upload/drive/v3/files/' + updateId + '?uploadType=media';
    fetch(url, {
        method: 'PATCH',
        headers: new Headers({
            Authorization: 'Bearer ' + gapi.auth.getToken().access_token,
            'Content-type': 'plain/text'
        }),
        body: document.querySelector('textarea').value
    }).then(value => {
        console.log('File updated successfully');
        document.querySelector('textarea').setAttribute('data-update-id', '');
        var updateBtn = document.getElementsByClassName('upload')[0];
        updateBtn.innerHTML = 'Backup';
        updateBtn.setAttribute('onClick', 'uploaded()');
    }).catch(err => console.error(err))
}

function deleteFile(v) {
    var id = v.parentElement.getAttribute('data-id');
    v.innerHTML = '...';
    var request = gapi.client.drive.files.delete({
        'fileId': id
    });
    request.execute(function (res) {
        console.log('File Deleted');
        v.innerHTML = 'Delete';
        expandContainer.style.display = 'none';
        expandContainerUl.setAttribute('data-id', '');
        expandContainerUl.setAttribute('data-name', '');
        // after delete update the list
        showList();
    })
}