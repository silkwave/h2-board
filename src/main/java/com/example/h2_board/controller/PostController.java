package com.example.h2_board.controller;

import com.example.h2_board.entity.Post;
import com.example.h2_board.service.PostService; // PostService import
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 게시물(Post)과 관련된 REST API 요청을 처리하는 컨트롤러 클래스입니다. */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {

  private final PostService postService; // PostService 주입

  /**
   * 모든 게시물 목록을 조회합니다.
   *
   * @return 게시물 목록 (JSON 형태)
   */
  @GetMapping
  public List<Post> getAllPosts() {
    log.trace("Entering getAllPosts");
    List<Post> posts = postService.findAll(); // postService 사용
    log.trace("Exiting getAllPosts with {} posts", posts.size());
    return posts;
  }

  /**
   * 특정 ID의 게시물 상세 정보를 조회합니다.
   *
   * @param id 게시물 ID
   * @return 특정 ID의 게시물 (JSON 형태), 없으면 404 Not Found
   */
  @GetMapping("/{id}")
  public ResponseEntity<Post> getPostById(@PathVariable Long id) {
    log.trace("Entering getPostById with id: {}", id);
    return postService // postService 사용
        .findById(id)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  /**
   * 새로운 게시물을 생성합니다.
   *
   * @param post 생성할 게시물 정보 (JSON 형태의 요청 본문)
   * @return 생성된 게시물 정보와 201 Created 상태 코드
   */
  @PostMapping
  public ResponseEntity<Post> createPost(@RequestBody Post post) {
    log.trace("Entering createPost with post: {}", post);
    postService.save(post); // postService.save 호출
    log.trace("Exiting createPost");
    return ResponseEntity.status(HttpStatus.CREATED).body(post); // 저장 후 업데이트된 post 객체 반환
  }

  /**
   * 기존 게시물을 수정합니다.
   *
   * @param id 수정할 게시물 ID
   * @param post 업데이트할 게시물 정보 (JSON 형태의 요청 본문)
   * @return 업데이트된 게시물 정보, 없으면 404 Not Found
   */
  @PutMapping("/{id}")
  public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post post) {
    log.trace("Entering updatePost with id: {} and post: {}", id, post);
    return postService // postService 사용
        .findById(id)
        .map(
            existingPost -> {
              post.setId(id);
              postService.save(post); // postService.save 호출
              log.trace("Exiting updatePost");
              return ResponseEntity.ok(post); // 업데이트된 post 객체 반환
            })
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  /**
   * 특정 ID의 게시물을 삭제합니다.
   *
   * @param id 삭제할 게시물 ID
   * @return 204 No Content 상태 코드, 없으면 404 Not Found
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePost(@PathVariable Long id) {
    log.trace("Entering deletePost with id: {}", id);
    return postService // postService 사용
        .findById(id)
        .map(
            p -> {
              postService.deleteById(id); // postService.deleteById 호출
              log.trace("Exiting deletePost");
              return ResponseEntity.noContent().<Void>build();
            })
        .orElseGet(() -> ResponseEntity.notFound().build());
  }
}