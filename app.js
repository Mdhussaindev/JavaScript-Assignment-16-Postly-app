// Elements
let loginForm = document.getElementById("loginForm")
let signupForm = document.getElementById("signupForm")
let postsPage = document.getElementById("postsPage")
let showSignup = document.getElementById("showSignup")
let showLogin = document.getElementById("showLogin")

let signupBtn = document.getElementById("signupBtn")
let loginBtn = document.getElementById("loginBtn")
let logoutBtn = document.getElementById("logoutBtn")
let addPostBtn = document.getElementById("addPostBtn")

let signupName = document.getElementById("signupName")
let signupPassword = document.getElementById("signupPassword")
let loginName = document.getElementById("loginName")
let loginPassword = document.getElementById("loginPassword")

let postTitle = document.getElementById("postTitle")
let postContent = document.getElementById("postContent")
let postsList = document.getElementById("postsList")
let userWelcome = document.getElementById("userWelcome")

// Data
let users = JSON.parse(localStorage.getItem("users")) || []
let posts = JSON.parse(localStorage.getItem("posts")) || []

// Toggle forms
showSignup.addEventListener("click", ()=>{
  loginForm.classList.remove("active")
  signupForm.classList.add("active")
})
showLogin.addEventListener("click", ()=>{
  signupForm.classList.remove("active")
  loginForm.classList.add("active")
})

// Helpers
function userExists(name){
  return users.some(user => user.name === name)
}
function getLoggedInUser(){
  return JSON.parse(localStorage.getItem("loggedInUser"))
}

// Signup
signupBtn.addEventListener("click", ()=>{
  let name = signupName.value.trim()
  let password = signupPassword.value.trim()

  if(!name || !password){
    Swal.fire({icon:"warning",title:"All fields required"})
    return
  }
  if(userExists(name)){
    Swal.fire({icon:"error",title:"User already exists"})
    return
  }
  users.push({name,password})
  localStorage.setItem("users",JSON.stringify(users))
  Swal.fire({icon:"success",title:"Account created",timer:1500,showConfirmButton:false})
  signupName.value = ""
  signupPassword.value = ""
  signupForm.classList.remove("active")
  loginForm.classList.add("active")
})

// Login
loginBtn.addEventListener("click", ()=>{
  let name = loginName.value.trim()
  let password = loginPassword.value.trim()
  let validUser = users.find(u => u.name===name && u.password===password)
  if(!validUser){
    Swal.fire({icon:"error",title:"Invalid credentials"})
    return
  }
  localStorage.setItem("loggedInUser",JSON.stringify(validUser))
  Swal.fire({icon:"success",title:"Login successful",timer:1200,showConfirmButton:false})
    .then(()=> showPostsPage())
})

// Logout
logoutBtn.addEventListener("click", ()=>{
  localStorage.removeItem("loggedInUser")
  postsPage.classList.remove("active")
  loginForm.classList.add("active")
})

// Show Posts Page
function showPostsPage(){
  let user = getLoggedInUser()
  if(!user) return
  loginForm.classList.remove("active")
  signupForm.classList.remove("active")
  postsPage.classList.add("active")
  userWelcome.textContent = user.name
  renderPosts()
}

// Add Post
addPostBtn.addEventListener("click", ()=>{
  let title = postTitle.value.trim()
  let content = postContent.value.trim()
  let user = getLoggedInUser()
  if(!title || !content){
    Swal.fire({icon:"warning",title:"Both fields required"})
    return
  }
  posts.push({id:Date.now(),user:title,content,owner:user.name})
  localStorage.setItem("posts",JSON.stringify(posts))
  postTitle.value = ""
  postContent.value = ""
  Swal.fire({icon:"success",title:"Post added",timer:1000,showConfirmButton:false})
  renderPosts()
})

// Render Posts
function renderPosts(){
  let user = getLoggedInUser()
  postsList.innerHTML = ""
  let userPosts = posts.filter(p => p.owner === user.name)
  if(userPosts.length===0){
    postsList.innerHTML = "<p>No posts yet.</p>"
    return
  }
  userPosts.forEach(post=>{
    let div = document.createElement("div")
    div.classList.add("post-card")
    div.innerHTML = `
      <h4>${post.user}</h4>
      <p>${post.content}</p>
      <button class="editBtn">Edit</button>
      <button class="deleteBtn">Delete</button>
    `
    let editBtn = div.querySelector(".editBtn")
    let deleteBtn = div.querySelector(".deleteBtn")

    editBtn.addEventListener("click", ()=>{
      Swal.fire({
        title:"Edit Post",
        html: `<input id="swalTitle" class="swal2-input" placeholder="Title" value="${post.user}">
               <textarea id="swalContent" class="swal2-textarea" placeholder="Content">${post.content}</textarea>`,
        confirmButtonText:"Update",
        preConfirm: ()=>{
          let newTitle = document.getElementById("swalTitle").value
          let newContent = document.getElementById("swalContent").value
          if(!newTitle || !newContent){
            Swal.showValidationMessage("Both fields required")
          }
          return {newTitle,newContent}
        }
      }).then(result=>{
        post.user = result.value.newTitle
        post.content = result.value.newContent
        localStorage.setItem("posts",JSON.stringify(posts))
        renderPosts()
        Swal.fire({icon:"success",title:"Updated",timer:1000,showConfirmButton:false})
      })
    })

    deleteBtn.addEventListener("click", ()=>{
      Swal.fire({
        title:"Delete this post?",
        icon:"warning",
        showCancelButton:true,
        confirmButtonText:"Yes",
      }).then(res=>{
        if(res.isConfirmed){
          posts = posts.filter(p=>p.id!==post.id)
          localStorage.setItem("posts",JSON.stringify(posts))
          renderPosts()
          Swal.fire({icon:"success",title:"Deleted",timer:1000,showConfirmButton:false})
        }
      })
    })

    postsList.appendChild(div)
  })
}

// Auto show posts if already logged in
if(getLoggedInUser()) showPostsPage()