package com.example.h2_board.service;

import com.example.h2_board.entity.Post;
import com.example.h2_board.mapper.PostMapper;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/** PostService의 구현체 클래스입니다. */
@Service
public class PostServiceImpl implements PostService {

  private final PostMapper postMapper;

  @Autowired
  public PostServiceImpl(PostMapper postMapper) {
    this.postMapper = postMapper;
  }

  @Override
  public List<Post> findAll() {
    return postMapper.findAll();
  }

  @Override
  public Optional<Post> findById(Long id) {
    return postMapper.findById(id);
  }

  @Override
  public Post save(Post post) {
    if (post.getId() == null) {
      postMapper.save(post);
    } else {
      postMapper.update(post);
    }
    return post;
  }

  @Override
  public void deleteById(Long id) {
    postMapper.deleteById(id);
  }
}
