package com.example.h2_board.entity;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter; // Setter import 추가

/**
 * 게시물(Post) 데이터 전송 객체(DTO) 클래스입니다.
 * 데이터베이스의 'post' 테이블의 데이터를 담는 역할을 합니다.
 */
@Getter // 모든 필드에 대한 getter 메서드를 자동으로 생성합니다.
@Setter // 모든 필드에 대한 setter 메서드를 자동으로 생성합니다.
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 인자 없는 생성자를 자동으로 생성하며, protected 접근 레벨로 설정합니다.
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자를 자동으로 생성합니다.
public class Post {

    private Long id; // 게시물 고유 ID

    private String title; // 게시물 제목

    private String content; // 게시물 내용
}
