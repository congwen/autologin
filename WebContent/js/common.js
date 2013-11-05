function $(objStr){return document.getElementById(objStr);}   
window.onload = function(){   
   //分析cookie值，显示上次的登陆信息   
    var usernameValue = getCookieValue("username");   
    $("username").value = usernameValue;   
   var passwordValue = getCookieValue("password");   
    $("password").value = passwordValue;       
   //写入点击事件   
    $("submit").onclick = function()   
    {   
        var usernameValue = $("username").value;   
        var passwordValue = $("password").value;   
        //服务器验证（模拟）       
        var isAdmin = usernameValue == "admin" && passwordValue =="1234567";   
        var isUserA = usernameValue == "userA" && passwordValue =="userA";   
        var isMatched = isAdmin || isUserA;   
        if(isMatched){   
            if( $("saveCookie").checked){     
                setCookie("username",$("username").value,24,"/");   
                setCookie("password",$("password").value,24,"/");   
            }       
            alert("登陆成功,欢迎你," + usernameValue + "!");   
           // self.location.replace("/welcome.jsp");   
        }   
        else alert("用户名或密码错误，请重新输入！");       
    }   
}  