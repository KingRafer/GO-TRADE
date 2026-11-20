/* Redirect if not logged in */
(function(){
  try {
    var s = JSON.parse(localStorage.getItem('gt_session')||'null');
    if (!s) location.href = (location.pathname.indexOf('/admin')===0 ? '../login.html' : '/login.html');
  } catch(e) { location.href = '/login.html'; }
})();
