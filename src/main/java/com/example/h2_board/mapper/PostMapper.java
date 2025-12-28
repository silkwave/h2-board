package com.example.h2_board.mapper;

import com.example.h2_board.entity.Post;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;

/** 게시물(Post) 데이터에 접근하기 위한 MyBatis 매퍼 인터페이스입니다. */
@Mapper
public interface PostMapper {

  /**
   * 모든 게시물을 조회합니다.
   *
   * @return 게시물 목록
   */
  List<Post> findAll();

  /**
   * ID를 기준으로 특정 게시물을 조회합니다.
   *
   * @param id 게시물 ID
   * @return Optional<Post> 객체
   */
  Optional<Post> findById(Long id);

  /**
   * 새로운 게시물을 저장합니다.
   *
   * @param post 저장할 게시물 정보
   */
  void save(Post post);

  /**
   * 기존 게시물을 수정합니다.
   *
   * @param post 수정할 게시물 정보
   */
  void update(Post post);

  /**
   * ID를 기준으로 특정 게시물을 삭제합니다.
   *
   * @param id 삭제할 게시물 ID
   */
  void deleteById(Long id);
}
