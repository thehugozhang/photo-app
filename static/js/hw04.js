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
            <a href = "#">Follow</a>
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
        likeHtml = `<i class="fa-solid fa-heart" aria-label="likePost" style = "color: #ed4956;" onclick="likeUnlike(this);" data-post-id="${post.id}" data-like-id="${post.current_user_like_id}"></i>`
    } else {
        likeHtml = `<i class="fa-regular fa-heart" aria-label="likePost" onclick="likeUnlike(this);" data-post-id="${post.id}"></i>`
    }
    if (post.current_user_bookmark_id) {
        bookmarkHtml = `<i class="fa-solid fa-bookmark"></i>`
    } else {
        bookmarkHtml = `<i class="fa-regular fa-bookmark"></i>`
    }
    if (post.comments.length > 0) {
        if (post.comments.length == 1) {
            commentHtml = `
                <p class = "card-comment"><span id = "poster">${ post.comments[0].user.username }</span>${ post.comments[0].text }</p>
            `
        } else {
            commentHtml = `
                <p class = "card-comment"><a href = "#" class = "card-comment-more">View all ${ post.comments.length } comments</a></p>
                <p class = "card-comment"><span id = "poster">${ post.comments[0].user.username }</span>${ post.comments[0].text }</p>
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
                    <p class = "card-comment"><span id = "poster">${ post.user.username }</span>${ post.caption }<span><a href = "#" class = "card-comment-more">more</a></span></p>
                    ` +
                    commentHtml
                    + `
                    <p class = "card-time">${ post.display_time }</p>
                </div>
            </div>
            <div class = "card-footer">
                <div class = "card-input">
                    <i class="fa-regular fa-face-smile"></i>
                    <input type="text" placeholder="Add a comment..." aria-label="commentInput">
                </div>
                <a href = "#">Post</a>
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
// 
// END Event Handlers
//