// src/main/resources/static/js/main.js

import { elements, cacheElements } from "./app/elements.js";
import { handlers } from "./app/handlers.js";
import { ui } from "./app/ui.js";

/** 애플리케이션 초기화 함수. DOM 로드 후 한 번 실행됩니다. */
function init() {
  // DOM 요소 캐싱
  cacheElements();

  // 이벤트 리스너 등록
  elements.createPostBtn.addEventListener("click", handlers.handleCreateClick);
  elements.savePostBtn.addEventListener("click", handlers.handleSaveClick);
  elements.cancelEditBtn.addEventListener("click", handlers.handleCancelClick);
  elements.postsTableBody.addEventListener("click", handlers.handleListClick);
  elements.deletePostBtn.addEventListener(
    "click",
    handlers.handleDetailDeleteClick
  );
  elements.generateGuidBtn.addEventListener("click", handlers.handleGenerateGuid);
  elements.commentForm.addEventListener("submit", handlers.handleCommentSubmit);

  // 초기 데이터 로드 및 목록 뷰 표시
  handlers.loadAndRenderPosts();
  ui.showSection("list");
}

// DOMContentLoaded 이벤트 발생 시 애플리케이션 초기화 함수 실행
document.addEventListener("DOMContentLoaded", () => {
  init();
});