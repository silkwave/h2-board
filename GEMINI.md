# Gemini Project Memory

## 프로젝트 개요
- **이름**: H2 게시판
- **설명**: Spring Boot와 Vanilla JavaScript를 사용한 간단한 웹 기반 게시판 애플리케이션입니다.
- **주요 기술**: Java, Spring Boot, MyBatis, H2 Database, Vanilla JS (ES6 Modules), HTML5, CSS.

## 백엔드 (Backend)
- **프레임워크**: Spring Boot
- **언어**: Java 21
- **빌드 도구**: Gradle
- **데이터베이스**: H2 (In-memory)
- **데이터 매핑**: MyBatis
- **아키텍처**: RESTful API 제공
  - 게시물(Post) CRUD API
  - 댓글(Comment) 생성 및 조회 API
  - GUID 생성 유틸리티 API

## 프론트엔드 (Frontend)
- **언어**: Vanilla JavaScript (ES6 모듈)
- **구조**: 기능별 모듈 분리
  - `main.js`: 애플리케이션 진입점 및 초기화
  - `app/`: 기능별 모듈 디렉토리
    - `api.js`: 백엔드 API 호출
    - `ui.js`: UI 렌더링 및 조작
    - `handlers.js`: 이벤트 핸들러
    - `elements.js`: DOM 요소 캐싱
    - `state.js`: 애플리케이션 상태 관리
    - `config.js`: 설정 값
- **마크업**: HTML5
- **스타일**: CSS

## 주요 기능
- **게시물**:
  - 등록, 조회, 수정, 삭제 (CRUD)
  - 목록 조회
- **댓글**:
  - 특정 게시물에 대한 댓글 작성
  - 특정 게시물의 댓글 목록 조회
- **GUID 생성기**:
  - GUID를 생성하고 화면에 표시하는 유틸리티 기능

## 사용자 선호사항
- **언어**: 코드 내 주석과 Gemini의 답변은 **한글**로 작성합니다.