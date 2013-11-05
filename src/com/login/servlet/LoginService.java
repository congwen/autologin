package com.login.servlet;

public class LoginService {   
	  
    public static boolean login(String username, String password) {   
        if ("admin".equals(username) && "123456".equals(password)) {   
            return true;   
        } else {   
            return false;   
        }   
    }   
}   
