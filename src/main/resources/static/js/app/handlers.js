// src/main/resources/static/js/app/handlers.js

import { api } from "./api.js";
import { ui } from "./ui.js";
import { state } from "./state.js";
import { elements } from "./elements.js";

/** 게시물 목록을 불러와 화면에 렌더링합니다. */
async function loadAndRenderPosts() {
  try {
    const posts = await api.getPosts();
    ui.renderPosts(posts);
  } catch (error) {
    elements.postsTableBody.innerHTML =
      '<tr><td colspan="3">게시물을 불러올 수 없습니다.</td></tr>';
  }
}

/** 새 게시물 작성 버튼 클릭 시 호출됩니다. */
function handleCreateClick() {
  ui.prepareDetailView("create");
}

/** 게시물 저장 버튼 클릭 시 호출됩니다 (생성 또는 수정). */
async function handleSaveClick(event) {
  event.preventDefault(); // 폼 제출 기본 동작 방지
  const { postId, postTitle, postContent, commentList } = elements;

  const postData = {
    title: postTitle.value,
    content: postContent.value,
  };

  const id = postId.value; // ID가 있으면 수정, 없으면 생성

  try {
    await (id ? api.updatePost(id, postData) : api.createPost(postData));
    ui.showNotification("게시물이 성공적으로 저장되었습니다.", "success");
    ui.showSection("list"); // 목록 뷰로 전환
    commentList.innerHTML = ""; // 댓글 목록 초기화
    loadAndRenderPosts(); // 목록 새로고침
  } catch (error) {
    // API 레이어에서 이미 알림을 처리함
  }
}

/** 편집 취소 버튼 클릭 시 호출됩니다. */
function handleCancelClick() {
  ui.showSection("list"); // 목록 뷰로 전환
  elements.commentList.innerHTML = ""; // 댓글 목록 초기화
}

/** 게시물 목록 테이블의 클릭 이벤트를 처리합니다 (이벤트 위임). */
function handleListClick(event) {
  const { target } = event;
  const { id } = target.dataset; // 클릭된 요소의 data-id 속성

  if (!id) {
    return;
  }

  if (target.classList.contains("view-post-link")) {
    event.preventDefault(); // 링크 기본 동작 방지
    viewPost(id);
  } else if (target.classList.contains("edit-btn")) {
    editPost(id);
  } else if (target.classList.contains("delete-btn")) {
    deletePost(id);
  }
}

/** 게시물 상세 뷰에서 삭제 버튼 클릭 시 호출됩니다. */
function handleDetailDeleteClick() {
  if (state.currentPostId) {
    deletePost(state.currentPostId);
  }
}

/** 특정 ID의 게시물 상세 정보를 불러와 표시합니다. */
async function viewPost(id) {
  try {
    const post = await api.getPost(id);
    ui.prepareDetailView("view", post); // 읽기 전용 뷰 준비
    const comments = await api.getComments(id);
    ui.renderComments(comments);
  } catch (error) {
    // API 레이어에서 이미 알림을 처리함
  }
}

/** 특정 ID의 게시물 정보를 불러와 수정 폼에 표시합니다. */
async function editPost(id) {
  try {
    const post = await api.getPost(id);
    ui.prepareDetailView("edit", post); // 수정 뷰 준비
  } catch (error) {
    // API 레이어에서 이미 알림을 처리함
  }
}

/** 특정 ID의 게시물을 삭제합니다. 사용자 확인 후 실행됩니다. */
function deletePost(id) {
  ui.showConfirm("정말로 이 게시물을 삭제하시겠습니까?", async (confirmed) => {
    if (confirmed) {
      try {
        await api.deletePost(id);
        ui.showNotification("게시물이 성공적으로 삭제되었습니다.", "success");
        // 현재 상세 뷰에 있다면 목록으로 이동
        if (elements.postDetailSection.style.display === "block") {
          ui.showSection("list");
        }
        loadAndRenderPosts(); // 목록 새로고침
      } catch (error) {
        // API 레이어에서 이미 알림을 처리함
      }
    }
  });
}

/** GUID 생성 버튼 클릭 시 호출됩니다. */
async function handleGenerateGuid() {
  ui.showNotification("GUID 생성 중...", "info");
  try {
    const guid = await api.generateGuid();
    if (guid) {
      elements.generatedGuidDisplay.textContent = guid;
      ui.showNotification("GUID가 성공적으로 생성되었습니다!", "success");
    }
  } catch (error) {
    // _fetch에서 이미 알림을 처리하므로 별도 처리 없음
  }
}

/** 댓글 폼 제출 시 호출됩니다. */
async function handleCommentSubmit(event) {
    event.preventDefault();
    const { commentContent } = elements;
    const content = commentContent.value.trim();

    if (!content) {
        ui.showNotification("댓글 내용을 입력해주세요.", "error");
        return;
    }

    if (state.currentPostId) {
        try {
            const newComment = await api.createComment(state.currentPostId, { content });
            ui.showNotification("댓글이 성공적으로 작성되었습니다.", "success");
            commentContent.value = ""; // 입력 필드 초기화
            // 댓글 목록 새로고침
            const comments = await api.getComments(state.currentPostId);
            ui.renderComments(comments);
        } catch (error) {
            // api 계층에서 오류 알림을 처리합니다.
        }
    }
}


export const handlers = {
  loadAndRenderPosts,
  handleCreateClick,
  handleSaveClick,
  handleCancelClick,
  handleListClick,
  handleDetailDeleteClick,
  handleGenerateGuid,
  handleCommentSubmit,
};

