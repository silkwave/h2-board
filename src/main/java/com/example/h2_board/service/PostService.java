package com.example.h2_board.service;

import com.example.h2_board.entity.Post;
import java.util.List;
import java.util.Optional;

/** 게시물 관련 비즈니스 로직을 처리하는 서비스 인터페이스입니다. */
public interface PostService {
  /**
   * 모든 게시물을 조회합니다.
   *
   * @return 게시물 목록
   */
  List<Post> findAll();

  /**
   * ID로 특정 게시물을 조회합니다.
   *
   * @param id 조회할 게시물의 ID
   * @return Optional<Post> 객체
   */
  Optional<Post> findById(Long id);

  /**
   * 새 게시물을 저장합니다.
   *
   * @param post 저장할 게시물 정보
   * @return 저장된 게시물
   */
  Post save(Post post);

  /**
   * 게시물을 삭제합니다.
   *
   * @param id 삭제할 게시물의 ID
   */
  void deleteById(Long id);
}
