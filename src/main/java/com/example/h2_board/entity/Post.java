package com.example.h2_board.entity;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 게시물(Post) 데이터 전송 객체(DTO) 클래스입니다. 데이터베이스의 'post' 테이블의 데이터를 담는 역할을 합니다. */
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Post {

  private Long id; // 게시물 고유 ID

  private String title; // 게시물 제목

  private String content; // 게시물 내용
}
