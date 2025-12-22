package com.example.h2_board.controller;

import com.example.h2_board.service.GuidService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/*
 * GUID를 요청하는 엔드포인트를 제공하는 REST 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/guid")
public class GuidController {

    private final GuidService guidService;

    /*
     * GuidService를 주입받아 컨트롤러를 초기화합니다.
     * @param guidService GUID 서비스를 제공하는 객체
     */
    public GuidController(GuidService guidService) {
        this.guidService = guidService;
    }

    /*
     * 새로운 GUID를 생성하고 반환합니다.
     * @return 생성된 GUID 문자열
     */
    @GetMapping("/generate")
    public String generateGuid() {
        return guidService.getGuid();
    }
}

