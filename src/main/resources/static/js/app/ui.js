// src/main/resources/static/js/app/ui.js

import { elements } from "./elements.js";
import { state } from "./state.js";

function showNotification(message, type = "info") {
  const { notificationContainer, statusMessageBar } = elements;

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notificationContainer.appendChild(notification);

  // 게시판 하단 상태 메시지 바 업데이트
  if (statusMessageBar) {
    statusMessageBar.textContent = message;
    statusMessageBar.className = `status-bar status-${type}`;
  }

  // 0.1초 후 투명도 효과를 위해 'show' 클래스 추가
  setTimeout(() => notification.classList.add("show"), 100);

  // 3초 후 알림 숨기기 및 제거
  setTimeout(() => {
    notification.classList.remove("show");
    notification.addEventListener("transitionend", () => notification.remove(), {
      once: true,
    });
  }, 3000);
}

function showConfirm(message, callback) {
  const { customConfirmModal, confirmMessage, confirmYesBtn, confirmNoBtn } =
    elements;

  confirmMessage.textContent = message;
  customConfirmModal.style.display = "flex"; // 모달 표시

  // 확인 버튼 클릭 시 처리
  const handleConfirm = () => {
    cleanup();
    callback(true);
  };

  // 취소 버튼 클릭 시 처리
  const handleCancel = () => {
    cleanup();
    callback(false);
  };

  // 이벤트 리스너 제거 및 모달 숨기기
  const cleanup = () => {
    customConfirmModal.style.display = "none"; // 모달 숨기기
    confirmYesBtn.removeEventListener("click", handleConfirm);
    confirmNoBtn.removeEventListener("click", handleCancel);
  };

  confirmYesBtn.addEventListener("click", handleConfirm);
  confirmNoBtn.addEventListener("click", handleCancel);
}

function renderPosts(posts) {
  const { postsTableBody } = elements;
  postsTableBody.innerHTML = ""; // 기존 목록 초기화
  if (!posts || posts.length === 0) {
    postsTableBody.innerHTML =
      '<tr><td colspan="3">게시물이 없습니다.</td></tr>';
    return;
  }
  posts.forEach((post, index) => {
    const row = postsTableBody.insertRow();
    row.innerHTML = `
                  <td>${index + 1}</td>
                  <td><a href="#" data-id="${
                    post.id
                  }" class="view-post-link">${post.title}</a></td>
                  <td>
                      <button class="action-btn edit-btn" data-id="${
                        post.id
                      }">수정</button>
                      <button class="action-btn delete-btn" data-id="${
                        post.id
                      }">삭제</button>
                  </td>
              `;
  });
}

function showSection(sectionName) {
  const { postListSection, postDetailSection } = elements;
  postListSection.style.display = sectionName === "list" ? "block" : "none";
  postDetailSection.style.display =
    sectionName === "detail" ? "block" : "none";
}

function prepareDetailView(mode, post = {}) {
  const {
    detailTitle,
    postId,
    postTitle,
    postContent,
    savePostBtn,
    deletePostBtn,
    commentSection,
  } = elements;

  state.currentPostId = post.id || null;
  postId.value = post.id || "";
  postTitle.value = post.title || "";
  postContent.value = post.content || "";

  const isReadOnly = mode === "view";
  postTitle.readOnly = isReadOnly;
  postContent.readOnly = isReadOnly;

  savePostBtn.style.display =
    mode === "create" || mode === "edit" ? "inline-block" : "none";
  deletePostBtn.style.display = mode === "view" ? "inline-block" : "none";

  // 댓글 섹션 표시 여부 제어
  commentSection.style.display = mode === 'view' ? 'block' : 'none';

  const titles = {
    create: "새 게시물 작성",
    edit: "게시물 수정",
    view: "게시물 상세",
  };
  detailTitle.textContent = titles[mode];

  showSection("detail");
}

function renderComments(comments) {
    const { commentList } = elements;
    commentList.innerHTML = ""; // 기존 댓글 목록 초기화

    if (!comments || comments.length === 0) {
        commentList.innerHTML = "<p>아직 댓글이 없습니다.</p>";
        return;
    }

    const commentElements = comments.map(comment => {
        const commentEl = document.createElement("div");
        commentEl.className = "comment";
        const createdAt = new Date(comment.createdAt).toLocaleString();
        commentEl.innerHTML = `
            <p class="comment-content">${comment.content}</p>
            <p class="comment-meta">작성일: ${createdAt}</p>
        `;
        return commentEl;
    });

    commentElements.forEach(el => commentList.appendChild(el));
}


export const ui = {
  showNotification,
  showConfirm,
  renderPosts,
  showSection,
  prepareDetailView,
  renderComments,
};
