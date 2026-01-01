package com.example.h2_board.entity;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class Comment {
    private Long id;
    private Long postId;
    private String content;
    private Timestamp createdAt;
}
