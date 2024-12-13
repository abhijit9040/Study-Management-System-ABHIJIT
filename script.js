function signOut(event)
{
    event.preventDefault();
    localStorage.removeItem("loginUser");
    window.location.href='login.html';
}