package com.example.h2_board;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * H2 기반 게시판 애플리케이션의 메인 클래스입니다.
 * Spring Boot 애플리케이션의 시작점 역할을 합니다.
 */
@SpringBootApplication // Spring Boot 애플리케이션임을 선언합니다.
public class H2BoardApplication {

	public static void main(String[] args) {
		SpringApplication.run(H2BoardApplication.class, args);
	}
}
