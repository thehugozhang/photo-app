// 
// BEGIN Page Initialization
//
const story2Html = story => {
    return `
        <div class = "story">
            <div class = "story-wrapper">
                <img src = "${ story.user.thumb_url }" alt="Profile image for ${ story.user.username }">
            </div>
            <p>${ story.user.username }</p>
        </div>
    `;
};

const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('');
            document.querySelector('.stories-panel').innerHTML = html;
        })
};

function user2Html(user) {
    return `
        <div class = "header">
            <img src="${ user.image_url }" alt="Profile image for ${ user.username }">
            <div class = "user">
                <p>${ user.username }</p>
                <p>${ user.first_name + " " + user.last_name }</p>
            </div>
        </div>
    `
}

const suggestion2Html = suggestion => {
    return `
        <div class = "suggestion">
            <img src="${suggestion.thumb_url}" alt="Profile image for ${ suggestion.username }">
            <div class = "suggestion-info">
                <p>${ suggestion.username }</p>
                <p>Suggested for you</p>
            </div>
            <a href="" onclick="followUnfollow(this); return false;" data-user-id="${suggestion.id}">Follow</a>
        </div>
    `
}

const displayUserProfile = () => {
    fetch('/api/profile')
        .then(response => response.json())
        .then(user => {
            const userHeader = user2Html(user)
            document.querySelector('.sidepanel').insertAdjacentHTML('afterBegin', userHeader);
        })
}

const displaySuggestions = () => {
    fetch('/api/suggestions')
        .then(response => response.json())
        .then(suggestions => {
            const suggestionHtml = suggestions.map(suggestion2Html).join('');
            document.querySelector('.recommendations').insertAdjacentHTML('beforeEnd', suggestionHtml);
        })
}

const post2Html = post => {
    var commentHtml = ``;
    var likeHtml = ``
    var bookmarkHtml = ``
    if (post.current_user_like_id) {
        likeHtml = `<i tabindex = "0" class="fa-solid fa-heart" aria-label="likePost" style = "color: #ed4956;" onclick="likeUnlike(this);" data-post-id="${post.id}" data-like-id="${post.current_user_like_id}"></i>`
    } else {
        likeHtml = `<i tabindex = "0" class="fa-regular fa-heart" aria-label="likePost" onclick="likeUnlike(this);" data-post-id="${post.id}"></i>`
    }
    if (post.current_user_bookmark_id) {
        bookmarkHtml = `<i tabindex = "0" class="fa-solid fa-bookmark" onclick="bookmarkUnbookmark(this);" data-post-id="${post.id}" data-like-id="${post.current_user_bookmark_id}"></i>`
    } else {
        bookmarkHtml = `<i tabindex = "0" class="fa-regular fa-bookmark" onclick="bookmarkUnbookmark(this);" data-post-id="${post.id}"></i>`
    }
    if (post.comments.length > 0) {
        if (post.comments.length == 1) {
            commentHtml = `
                <p class = "card-comment" id = "${"firstcomment" + post.id}"><span id = "poster">${ post.comments[0].user.username }</span>${ post.comments[0].text }</p>
            `
        } else {
            commentHtml = `
                <p class = "card-comment"><a href = "#" class = "card-comment-more open" onclick="openModal(this);" id = "${"commentcount" + post.id}">View all ${ post.comments.length } comments</a></p>
                <p class = "card-comment" id = "${"firstcomment" + post.id}"><span id = "poster">${ post.comments[0].user.username }</span>${ post.comments[0].text }</p>
            `
        }
    }
    return `
        <div class = "card">
            <div class = "card-header">
                <p>${ post.user.username }</p>
                <i class="fa-solid fa-ellipsis"></i>
            </div>
            <div class = "card-img">
                <img src="${ post.image_url }" alt="Post image for ${ post.user.username }">
            </div>
            <div class = "card-body">
                <div class = "card-interactions">
                    <div class = "card-triple-icons">
                        ` + likeHtml + `
                        <i class="fa-regular fa-comment" aria-label="commentPost"></i>
                        <i class="fa-regular fa-paper-plane" aria-label="sharePost"></i>
                    </div>
                   `  + bookmarkHtml + `
                </div>
                <div class = "card-likes">
                    <p id = "${"likes" + post.id}">${ post.likes.length } likes</p>
                </div>
                <div class = "card-comments">
                    <p class = "card-comment" id = "${"commentmarker" + post.id}"><span id = "poster">${ post.user.username }</span>${ post.caption }<span><a href = "#" class = "card-comment-more">more</a></span></p>
                    ` +
                    commentHtml
                    + `
                    <p class = "card-time">${ post.display_time }</p>
                </div>
            </div>
            <div class = "card-footer">
                <div class = "card-input">
                    <i class="fa-regular fa-face-smile"></i>
                    <input type="text" placeholder="Add a comment..." aria-label="commentInput" id = "${"commentbox" + post.id}">
                </div>
                <a href = "" onclick = "postComment(this); return false;" data-commentbox-id = "${post.id}">Post</a>
            </div>
        </div>
    `
}

const displayCards = () => {
    fetch('/api/posts/?limit=10')
        .then(response => response.json())
        .then(posts => {
            const postHtml = posts.map(post2Html).join('');
            document.querySelector('.cards').innerHTML = postHtml;
        })
}

const initPage = () => {
    displayStories();
    displayUserProfile();
    displaySuggestions();
    displayCards();
};

// invoke init page to display stories:
initPage();

// 
// END Page Initialization
// BEGIN Event Handlers
//
function likeUnlike(element) {
    var pid = parseInt(element.getAttribute("data-post-id"))
    if (element.getAttribute("data-like-id")) {
        // like to unlike
        var cid = parseInt(element.getAttribute("data-like-id"))
        fetch('/api/posts/likes/' + cid, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById("likes" + pid).innerHTML = (parseInt(document.getElementById("likes" + pid).innerHTML.split(' ')[0]) - 1) + " likes"
            element.classList.remove("fa-solid")
            element.classList.add("fa-regular")
            element.style.color = "#000"
            element.removeAttribute('data-like-id')
        });   
    } else {
        // unlike to like
        const postData = {
            "post_id": pid
        };
        fetch('/api/posts/likes', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById("likes" + pid).innerHTML = (parseInt(document.getElementById("likes" + pid).innerHTML.split(' ')[0]) + 1) + " likes"
            element.classList.add("fa-solid")
            element.classList.remove("fa-regular")
            element.style.color = "#ed4956"
            element.setAttribute("data-like-id", data.id)
        });
    }
}

function bookmarkUnbookmark(element) {
    var pid = parseInt(element.getAttribute("data-post-id"))
    if (element.getAttribute("data-bookmark-id")) {
        // bookmark to unbookmark
        var cid = parseInt(element.getAttribute("data-bookmark-id"))
        fetch("/api/bookmarks/" + cid, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            element.classList.remove("fa-solid")
            element.classList.add("fa-regular")
            element.removeAttribute('data-bookmark-id')
        }); 

    } else {
        // unbookmark to bookmark
        const postData = {
            "post_id": pid
        };
        
        fetch("/api/bookmarks", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            element.classList.add("fa-solid")
            element.classList.remove("fa-regular")
            element.setAttribute("data-bookmark-id", data.id)
        });
    }
}

function followUnfollow(element) {
    var uid = parseInt(element.getAttribute("data-user-id"))
    if (element.getAttribute("data-follow-id")) {
        // follow to unfollow
        var fid = parseInt(element.getAttribute("data-follow-id"))
        fetch("http://localhost:5000/api/following/" + fid, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            element.innerHTML = "Follow"
            element.removeAttribute('data-follow-id')
        });


    } else {
        // unfollow to follow
        const postData = {
            "user_id": uid
        };
        
        fetch("/api/following", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                element.innerHTML = "Unfollow"
                element.setAttribute('data-follow-id', data.id)
            });
    }
}

function postComment(element) {
    var pid = parseInt(element.getAttribute("data-commentbox-id"))
    if (document.getElementById("commentbox" + pid).value) {
        // post comment
        const postData = {
            "post_id": pid,
            "text": document.getElementById("commentbox" + pid).value,
        };
        
        fetch("/api/comments", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (document.getElementById("commentcount" + data.post_id)) {
                    // already more than 1 comment
                    document.getElementById("commentcount" + data.post_id).innerHTML = "View all " + (parseInt(document.getElementById("commentcount" + data.post_id).innerHTML.split(' ')[2]) + 1) + " comments"
                    document.getElementById("firstcomment" + data.post_id).innerHTML = `<span id = "poster">${data.user.username}</span>${ data.text }`
                } else {
                    if (document.getElementById("firstcomment" + data.post_id)) {
                        // 1 comment so add update first comment and add "View all X comments" label
                        var newcommentcount = `<p class = "card-comment"><a href = "#" class = "card-comment-more open" onclick="openModal(this);" id = "${"commentcount" + data.post_id}">View all 2 comments</a></p>`
                        document.getElementById("firstcomment" + data.post_id).innerHTML = `<span id = "poster">${data.user.username}</span>${ data.text }`
                        document.getElementById("commentmarker" + data.post_id).insertAdjacentHTML('afterend', newcommentcount)
                    } else {
                        // only caption so add only first comment
                        var newfirstcomment = `<p class = "card-comment" id = "${"firstcomment" + data.post_id}"><span id = "poster">${data.user.username}</span>${ data.text }</p>`
                        document.getElementById("commentmarker" + data.post_id).insertAdjacentHTML('afterend', newfirstcomment)
                    }

                }
                document.getElementById("commentbox" + pid).value = ""
                document.getElementById("commentbox" + pid).focus();
            });
    } else {
        // empty comment box
        document.getElementById("commentbox" + pid).focus();
    }
}

// 
// END Event Handlers
// BEGIN Modal Implementation
const modalElement = document.querySelector('.modal-bg');

function modalcomment2Html(comment) {
    return `
        <div class = "modal-comment">
            <div class = "modal-comment-align">
                <img src="${comment.user.thumb_url}" alt="comment profile pic">
                <div class = "modal-caption-box">
                    <p class = "modal-caption" id = "modal-caption"><span id = "poster">${comment.user.username}</span>${comment.text}</p>
                    <p class = "modal-time">${comment.display_time}</p>
                </div> 
            </div>
            <i tabindex = "0" class="fa-regular fa-heart" aria-label="likeComment"></i>
        </div>
    `
}
function openModal(element) {
    var pid = parseInt(element.id.slice(12))
    console.log('open!', pid);
    fetch("/api/posts/" + pid, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        document.getElementById("modal-img").src = data.image_url
        document.getElementById("modalheader").innerHTML = data.user.username
        document.getElementById("modalheader-prof").src = data.user.thumb_url
        const modalcomments = data.comments.map(modalcomment2Html).join('');
        document.querySelector(".modal-comments-body").insertAdjacentHTML('beforeend', `
            <div class = "modal-comment" style = "margin-top: 88px">
                <div class = "modal-comment-align">
                    <img src="${data.user.thumb_url}" alt="comment profile pic">
                    <div class = "modal-caption-box">
                        <p class = "modal-caption" id = "modal-caption"><span id = "poster">${data.user.username}</span>${data.caption}</p>
                        <p class = "modal-time">${data.display_time}</p>
                    </div> 
                </div>
                <i tabindex = "0" class="fa-regular fa-heart" aria-label="likeComment"></i>
            </div>
        `)
        document.querySelector(".modal-comments-body").insertAdjacentHTML('beforeend', modalcomments)
        modalElement.classList.remove('hidden');
        modalElement.setAttribute('aria-hidden', 'false');
        document.querySelector('.close').focus();
    });
    
}

const closeModal = ev => {
    console.log('close!');
    modalElement.classList.add('hidden');
    modalElement.setAttribute('aria-hidden', 'false');
    document.querySelector('.open').focus();
};


function keyPress (e) {
    if(e.key === "Escape") {
        
    }
}

document.onkeydown = function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape) {
        console.log("test")
        if (modalElement.getAttribute('aria-hidden') == 'false') {
            console.log('close!');
            modalElement.classList.add('hidden');
            modalElement.setAttribute('aria-hidden', 'false');
            document.querySelector('.open').focus();
        }
    }
};

//
// END Modal Implementation
//