<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
</head>
<body>

<form action="login.do">  
    用户名：<input type="text" name="username" ><br/>  
    密    码：<input type="text" name="password" ><br/>  
       
    <input type="submit" value="登录" />
    <select name="saveTime">  
    <option value="366">一年</option>  
    <option value="183">半年</option>  
     <option value="30">一个月</option>    
     <option value="7">一周</option>  
    </select>  
  </form>  

</body>
</html>