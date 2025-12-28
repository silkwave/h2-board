package com.example.h2_board.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** 애플리케이션의 루트 경로('/') 요청을 처리하는 컨트롤러입니다. 모든 요청을 정적 파일인 'index.html'로 리다이렉션합니다. */
@Controller
public class RootController {

  /**
   * 루트 경로('/')로 들어오는 요청을 처리하여 'index.html' 페이지로 리다이렉션합니다.
   *
   * @return 'index.html'로의 리다이렉션 경로
   */
  @GetMapping("/")
  public String root() {
    return "redirect:/index.html";
  }
}
