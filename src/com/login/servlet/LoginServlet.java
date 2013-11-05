package com.login.servlet;

import java.io.IOException;   

import javax.servlet.ServletException;   
import javax.servlet.http.Cookie;   
import javax.servlet.http.HttpServlet;   
import javax.servlet.http.HttpServletRequest;   
import javax.servlet.http.HttpServletResponse;   
  
public class LoginServlet extends HttpServlet {   
  
  
    public void doGet(HttpServletRequest request, HttpServletResponse response)   
            throws ServletException, IOException {   
        this.doPost(request, response);   
    }   
  
    public void doPost(HttpServletRequest request, HttpServletResponse response)   
            throws ServletException, IOException {   
         String username=request.getParameter("username");   
           String password=request.getParameter("password");   
           String savetime=request.getParameter("saveTime");   
           if(LoginService.login(username, password)){   
               if(null!=savetime&&!savetime.isEmpty()){   
                   int saveTime=Integer.parseInt(savetime);//这里接受的表单值为天来计算的   
                   int seconds=saveTime*24*60*60;   
                   Cookie cookie = new Cookie("user", username+"=="+password);   
                   cookie.setMaxAge(seconds);                      
                   response.addCookie(cookie);   
               }   
               request.setAttribute("username",username);   
               request.getRequestDispatcher("/main.jsp").forward(request,response);   
           }else{   
               request.getRequestDispatcher("/index.jsp").forward(request,response);   
           }   
    }   
  
}  