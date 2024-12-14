const signupdiv=document.getElementById("signup");
const logindiv=document.getElementById("login");
let user=(JSON.parse(localStorage.getItem("users"))||[{"username":"dummy","email":"dummy@email.com","password":"dummypass"}])
let loginuser=JSON.parse(localStorage.getItem("loginUser"))
console.log(loginuser)
if(loginuser)
{
    alert("Welcome "+loginuser.name)
    window.location.href='index.html'
}

console.log(user)

function addUser(username,email,password)
{
    user.push({username,email,password})
}

function signinSubmit()
{
    const username=document.getElementById("username").value;
    const password=document.getElementById("pass").value;
    const email=document.getElementById("email").value;
    if(user.find((users)=>users.email===email))
    {
        alert("User already present")
        showLogin(event);
        return;
    }
    addUser(username,email,password)
    localStorage.setItem("users",JSON.stringify(user));
    alert("User added successfully")
    showLogin(event);
}

console.log(user)

function loginSubmit(event)
{
    event.preventDefault();
    const loginemail=document.getElementById("loginemail").value;
    const loginpass=document.getElementById("loginpass").value;
    const founduser=user.find((users)=>users.email===loginemail)
    if(founduser)
    {
        if(loginpass==founduser.password)
        {
            alert("Login successful!");
            localStorage.setItem("loginUser",JSON.stringify({"name":founduser.username,"email":loginemail}))
            window.location.href='LandingPage.html'
            return;
        }
        else
        {
            alert("Incorrect password");
        }
    }
    else
    {
        alert("User does not exist");
    }
}

function showSignup(event)
{
    event.preventDefault();
    logindiv.style.display="none";
    signupdiv.style.display="block";
}

function showLogin(event)
{
    event.preventDefault();
    logindiv.style.display="block";
    signupdiv.style.display="none";
}