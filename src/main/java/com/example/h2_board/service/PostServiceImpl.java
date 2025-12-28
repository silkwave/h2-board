package com.example.h2_board.service;

import com.example.h2_board.entity.Post;
import com.example.h2_board.mapper.PostMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/** 게시물 관련 비즈니스 로직을 처리하는 서비스 구현체입니다. */
@Service
public class PostServiceImpl implements PostService {

    private final PostMapper postMapper;

    public PostServiceImpl(PostMapper postMapper) {
        this.postMapper = postMapper;
    }

    /**
     * 모든 게시물을 조회합니다.
     *
     * @return 게시물 목록
     */
    @Override
    public List<Post> findAll() {
        return postMapper.findAll();
    }

    /**
     * ID로 특정 게시물을 조회합니다.
     *
     * @param id 조회할 게시물의 ID
     * @return Optional<Post> 객체
     */
    @Override
    public Optional<Post> findById(Long id) {
        return postMapper.findById(id);
    }

    /**
     * 새 게시물을 저장합니다.
     *
     * @param post 저장할 게시물 정보
     * @return 저장된 게시물
     */
    @Override
    public Post save(Post post) {
        if (post.getId() == null) {
            // 새 게시물 저장
            postMapper.save(post);
        } else {
            // 기존 게시물 업데이트
            postMapper.update(post);
        }
        return post;
    }

    /**
     * 게시물을 삭제합니다.
     *
     * @param id 삭제할 게시물의 ID
     */
    @Override
    public void deleteById(Long id) {
        postMapper.deleteById(id);
    }
}
