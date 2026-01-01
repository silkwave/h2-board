package com.example.h2_board.service;

import com.example.h2_board.entity.Comment;
import com.example.h2_board.mapper.CommentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentMapper commentMapper;

    @Override
    public List<Comment> getCommentsByPostId(Long postId) {
        return commentMapper.findByPostId(postId);
    }

    @Override
    public Comment createComment(Comment comment) {
        commentMapper.insert(comment);
        return comment;
    }
}
