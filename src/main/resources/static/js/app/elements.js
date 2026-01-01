// src/main/resources/static/js/app/elements.js

// 자주 사용하는 DOM 요소들을 캐싱하여 접근 속도를 높이는 객체
export const elements = {};

// DOM 요소 캐싱 함수
export function cacheElements() {
  const elementIds = [
    "post-list-section",
    "post-detail-section",
    "postsTableBody",
    "createPostBtn",
    "savePostBtn",
    "cancelEditBtn",
    "deletePostBtn",
    "postId",
    "postTitle",
    "postContent",
    "detailTitle",
    "notification-container",
    "custom-confirm-modal",
    "confirm-message",
    "confirm-yes-btn",
    "confirm-no-btn",
    "status-message-bar",
    "generateGuidBtn",
    "generatedGuidDisplay",
    "comment-section",
    "comment-list",
    "comment-form",
    "comment-content",
  ];

  elementIds.forEach((id) => {
    // ID를 카멜케이스로 변환하여 elements 객체에 저장 (예: 'post-list-section' -> 'postListSection')
    const camelCaseId = id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
    elements[camelCaseId] = document.getElementById(id);
  });
}
