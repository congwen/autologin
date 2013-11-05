package com.login.servlet;

import java.io.IOException;   

import javax.servlet.Filter;   
import javax.servlet.FilterChain;   
import javax.servlet.FilterConfig;   
import javax.servlet.ServletException;   
import javax.servlet.ServletRequest;   
import javax.servlet.ServletResponse;   
import javax.servlet.http.Cookie;   
import javax.servlet.http.HttpServletRequest;   
import javax.servlet.http.HttpServletResponse;   
  
public class IndexFilter implements Filter {   
  
    public void destroy() {   
        // TODO Auto-generated method stub   
  
    }   
  
    public void doFilter(ServletRequest arg0, ServletResponse arg1,   
            FilterChain arg2) throws IOException, ServletException {   
        HttpServletRequest request = (HttpServletRequest) arg0;   
        HttpServletResponse response = (HttpServletResponse) arg1;   
        Cookie[] cookies = request.getCookies();   
        String[] cooks = null;   
        String username = null;   
        String password = null;   
        if (cookies != null) {   
            for (Cookie coo : cookies) {   
                String aa = coo.getValue();   
                cooks = aa.split("==");   
                if (cooks.length == 2) {   
                    username = cooks[0];   
                    password = cooks[1];   
                }   
            }   
        }   
        if (LoginService.login(username, password)) {   
            request.getSession().setAttribute("username",username);   
            response.sendRedirect("main.jsp");   
            //request.getRequestDispatcher("/main.jsp").forward(request, response);   
        }else{   
            arg2.doFilter(request,response );   
        }   
       
  
    }   
  
    public void init(FilterConfig arg0) throws ServletException {   
        // TODO Auto-generated method stub   
  
    }   
  
}   
