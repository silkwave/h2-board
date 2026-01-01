package com.example.h2_board.mapper;

import com.example.h2_board.entity.Comment;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface CommentMapper {
    // 특정 게시물의 댓글 목록 조회
    List<Comment> findByPostId(Long postId);

    // 댓글 추가
    void insert(Comment comment);
}
