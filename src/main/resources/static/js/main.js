// src/main/resources/static/js/main.js

// 애플리케이션의 핵심 로직을 담는 객체
const app = {
  // 애플리케이션 설정 값들을 정의하는 객체
  config: {
    API_BASE_URL: "/api/posts", // 게시물 API의 기본 URL
    GUID_API_URL: "/api/guid/generate", // GUID 생성 API의 URL
  },

  // 애플리케이션의 현재 상태를 저장하는 객체
  state: {
    currentPostId: null, // 현재 선택되거나 편집 중인 게시물의 ID
  },

  // 자주 사용하는 DOM 요소들을 캐싱하여 접근 속도를 높이는 객체
  elements: {},

  // API 요청을 처리하는 서비스 모듈
  api: {
    /**
     * 공통 fetch 래퍼 함수 (모든 API 요청에 사용)
     * HTTP 응답을 처리하고 오류 발생 시 알림을 표시합니다.
     * @param {string} url - 요청할 URL
     * @param {object} options - fetch API에 전달할 옵션 (메서드, 헤더, 본문 등)
     * @returns {Promise<any>} - 서버 응답 (JSON 또는 텍스트)
     */
    async _fetch(url, options = {}) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP 오류! 상태: ${response.status}, 메시지: ${errorText}`
          );
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        }
        return response.text();
      } catch (error) {
        console.error("API 호출 실패:", error);
        app.ui.showNotification(`API 요청 실패: ${error.message}`, "error");
        throw error; // 호출자가 오류를 처리할 수 있도록 다시 throw
      }
    },

    /** GUID를 생성하는 API를 호출하고 결과를 화면에 표시합니다. */
    async generateGuid() {
      app.ui.showNotification("GUID 생성 중...", "info");
      try {
        const guid = await this._fetch(app.config.GUID_API_URL);
        app.elements.generatedGuidDisplay.textContent = guid;
        app.ui.showNotification("GUID가 성공적으로 생성되었습니다!", "success");
      } catch (error) {
        // _fetch에서 이미 알림을 처리하므로 별도 처리 없음
      }
    },

    /** 모든 게시물 목록을 조회하는 API를 호출합니다. */
    async getPosts() {
      const posts = await this._fetch(app.config.API_BASE_URL);
      return posts;
    },

    /** 특정 ID의 게시물 상세 정보를 조회하는 API를 호출합니다. */
    async getPost(id) {
      const post = await this._fetch(`${app.config.API_BASE_URL}/${id}`);
      return post;
    },

    /** 새로운 게시물을 생성하는 API를 호출합니다. */
    async createPost(postData) {
      const result = await this._fetch(app.config.API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      return result;
    },

    /** 기존 게시물을 수정하는 API를 호출합니다. */
    async updatePost(id, postData) {
      const result = await this._fetch(`${app.config.API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      return result;
    },

    /** 특정 ID의 게시물을 삭제하는 API를 호출합니다. */
    async deletePost(id) {
      const result = await this._fetch(`${app.config.API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      return result;
    },
  },

  // 사용자 인터페이스 관련 로직을 처리하는 모듈
  ui: {
    /**
     * 화면 상단에 알림 메시지를 표시합니다.
     * @param {string} message - 표시할 메시지
     * @param {string} type - 알림 유형 (info, success, error 등)
     */
    showNotification(message, type = "info") {
      const { notificationContainer, statusMessageBar } = app.elements;

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
        notification.addEventListener(
          "transitionend",
          () => notification.remove(),
          { once: true }
        );
      }, 3000);
    },

    /**
     * 사용자 정의 확인(Confirm) 모달을 표시합니다.
     * @param {string} message - 사용자에게 보여줄 질문 메시지
     * @param {function} callback - 사용자의 응답(true/false)을 처리할 콜백 함수
     */
    showConfirm(message, callback) {
      const {
        customConfirmModal,
        confirmMessage,
        confirmYesBtn,
        confirmNoBtn,
      } = app.elements;

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
    },

    /**
     * 게시물 목록을 테이블에 렌더링합니다.
     * @param {Array<Object>} posts - 표시할 게시물 객체 배열
     */
    renderPosts(posts) {
      const { postsTableBody } = app.elements;
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
    },

    /**
     * 섹션을 전환하여 표시하거나 숨깁니다.
     * @param {string} sectionName - 표시할 섹션의 이름 ('list' 또는 'detail')
     */
    showSection(sectionName) {
      const { postListSection, postDetailSection } = app.elements;
      postListSection.style.display = sectionName === "list" ? "block" : "none";
      postDetailSection.style.display =
        sectionName === "detail" ? "block" : "none";
    },

    /**
     * 게시물 상세/생성/수정 뷰를 준비하고 데이터를 채웁니다.
     * @param {string} mode - 뷰 모드 ('create', 'edit', 'view')
     * @param {Object} post - 표시할 게시물 데이터 (새 게시물 생성 시 빈 객체)
     */
    prepareDetailView(mode, post = {}) {
      const {
        detailTitle,
        postId,
        postTitle,
        postContent,
        savePostBtn,
        deletePostBtn,
      } = app.elements;

      app.state.currentPostId = post.id || null;
      postId.value = post.id || "";
      postTitle.value = post.title || "";
      postContent.value = post.content || "";

      const isReadOnly = mode === "view";
      postTitle.readOnly = isReadOnly;
      postContent.readOnly = isReadOnly;

      savePostBtn.style.display =
        mode === "create" || mode === "edit" ? "inline-block" : "none";
      deletePostBtn.style.display = mode === "view" ? "inline-block" : "none";

      const titles = {
        create: "새 게시물 작성",
        edit: "게시물 수정",
        view: "게시물 상세",
      };
      detailTitle.textContent = titles[mode];

      this.showSection("detail");
    },
  },

  // 이벤트 처리를 담당하는 핸들러 모듈
  handlers: {
    /** 게시물 목록을 불러와 화면에 렌더링합니다. */
    async loadAndRenderPosts() {
      try {
        const posts = await app.api.getPosts();
        app.ui.renderPosts(posts);
      } catch (error) {
        app.elements.postsTableBody.innerHTML =
          '<tr><td colspan="3">게시물을 불러올 수 없습니다.</td></tr>';
      }
    },

    /** 새 게시물 작성 버튼 클릭 시 호출됩니다. */
    handleCreateClick() {
      app.ui.prepareDetailView("create");
    },

    /** 게시물 저장 버튼 클릭 시 호출됩니다 (생성 또는 수정). */
    async handleSaveClick(event) {
      event.preventDefault(); // 폼 제출 기본 동작 방지
      const { postId, postTitle, postContent } = app.elements;

      const postData = {
        title: postTitle.value,
        content: postContent.value,
      };

      const id = postId.value; // ID가 있으면 수정, 없으면 생성

      try {
        await (id
          ? app.api.updatePost(id, postData)
          : app.api.createPost(postData));
        app.ui.showNotification(
          "게시물이 성공적으로 저장되었습니다.",
          "success"
        );
        app.ui.showSection("list"); // 목록 뷰로 전환
        this.loadAndRenderPosts(); // 목록 새로고침
      } catch (error) {
        // API 레이어에서 이미 알림을 처리함
      }
    },

    /** 편집 취소 버튼 클릭 시 호출됩니다. */
    handleCancelClick() {
      app.ui.showSection("list"); // 목록 뷰로 전환
    },

    /** 게시물 목록 테이블의 클릭 이벤트를 처리합니다 (이벤트 위임). */
    handleListClick(event) {
      const { target } = event;
      const { id } = target.dataset; // 클릭된 요소의 data-id 속성

      if (!id) {
        return;
      }

      if (target.classList.contains("view-post-link")) {
        event.preventDefault(); // 링크 기본 동작 방지
        this.viewPost(id);
      } else if (target.classList.contains("edit-btn")) {
        this.editPost(id);
      } else if (target.classList.contains("delete-btn")) {
        this.deletePost(id);
      }
    },

    /** 게시물 상세 뷰에서 삭제 버튼 클릭 시 호출됩니다. */
    handleDetailDeleteClick() {
      if (app.state.currentPostId) {
        this.deletePost(app.state.currentPostId);
      }
    },

    /** 특정 ID의 게시물 상세 정보를 불러와 표시합니다. */
    async viewPost(id) {
      try {
        const post = await app.api.getPost(id);
        app.ui.prepareDetailView("view", post); // 읽기 전용 뷰 준비
      } catch (error) {
        // API 레이어에서 이미 알림을 처리함
      }
    },

    /** 특정 ID의 게시물 정보를 불러와 수정 폼에 표시합니다. */
    async editPost(id) {
      try {
        const post = await app.api.getPost(id);
        app.ui.prepareDetailView("edit", post); // 수정 뷰 준비
      } catch (error) {
        // API 레이어에서 이미 알림을 처리함
      }
    },

    /** 특정 ID의 게시물을 삭제합니다. 사용자 확인 후 실행됩니다. */
    deletePost(id) {
      app.ui.showConfirm(
        "정말로 이 게시물을 삭제하시겠습니까?",
        async (confirmed) => {
          if (confirmed) {
            try {
              await app.api.deletePost(id);
              app.ui.showNotification(
                "게시물이 성공적으로 삭제되었습니다.",
                "success"
              );
              // 현재 상세 뷰에 있다면 목록으로 이동
              if (app.elements.postDetailSection.style.display === "block") {
                app.ui.showSection("list");
              }
              this.loadAndRenderPosts(); // 목록 새로고침
            } catch (error) {
              // API 레이어에서 이미 알림을 처리함
            }
          }
        }
      );
    },
  },

  /** 애플리케이션 초기화 함수. DOM 로드 후 한 번 실행됩니다. */
  init() {
    // DOM 요소 캐싱
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
    ];
    elementIds.forEach((id) => {
      // ID를 카멜케이스로 변환하여 elements 객체에 저장 (예: 'post-list-section' -> 'postListSection')
      const camelCaseId = id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
      this.elements[camelCaseId] = document.getElementById(id);
    });

    // 핸들러 내부의 'this'가 app.handlers를 가리키도록 바인딩
    // (이벤트 리스너 콜백에서 'this'가 이벤트 타겟을 가리키는 것을 방지)
    Object.keys(this.handlers).forEach((key) => {
      this.handlers[key] = this.handlers[key].bind(this.handlers);
    });

    // 이벤트 리스너 등록
    this.elements.createPostBtn.addEventListener(
      "click",
      this.handlers.handleCreateClick
    );
    this.elements.savePostBtn.addEventListener(
      "click",
      this.handlers.handleSaveClick
    );
    this.elements.cancelEditBtn.addEventListener(
      "click",
      this.handlers.handleCancelClick
    );
    this.elements.postsTableBody.addEventListener(
      "click",
      this.handlers.handleListClick
    );
    this.elements.deletePostBtn.addEventListener(
      "click",
      this.handlers.handleDetailDeleteClick
    );
    this.elements.generateGuidBtn.addEventListener(
      "click",
      this.api.generateGuid.bind(this.api)
    );

    // 초기 데이터 로드 및 목록 뷰 표시
    this.handlers.loadAndRenderPosts();
    this.ui.showSection("list");
  },
};

// DOMContentLoaded 이벤트 발생 시 애플리케이션 초기화 함수 실행
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
