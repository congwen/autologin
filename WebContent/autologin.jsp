<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
<script type="text/javascript" src="js/cookie.js"></script>
<script type="text/javascript" src="js/common.js"></script>
</head>
<body>

<form action="login.do">  
    用户名：<input type="text" name="username"  id="username"><br/>  
    密    码：<input type="text" name="password" id="password"><br/>  
       
    <input type="submit" value="登录" />
    <p>
			<span style="font-size: 12px; color: blue;">记住密码</span> <input
				id="saveCookie" type="checkbox" value="" />
		</p>
    <select name="saveTime">  
    <option value="366">一年</option>  
    <option value="183">半年</option>  
     <option value="30">一个月</option>    
     <option value="7">一周</option>  
    </select>  
  </form>  

</body>
</html>