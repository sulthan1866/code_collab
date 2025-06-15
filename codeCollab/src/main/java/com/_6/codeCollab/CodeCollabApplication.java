package com._6.codeCollab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.socket.config.annotation.EnableWebSocket;

@SpringBootApplication
@EnableWebSocket
public class CodeCollabApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodeCollabApplication.class, args);
    }

}
