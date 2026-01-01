package com.example.h2_board.service;

import com.example.h2_board.entity.Comment;

import java.util.List;

public interface CommentService {
    List<Comment> getCommentsByPostId(Long postId);
    Comment createComment(Comment comment);
}
