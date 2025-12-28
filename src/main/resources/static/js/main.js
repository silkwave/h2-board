// src/main/resources/static/js/main.js

// 애플리케이션의 핵심 로직을 담는 객체
const app = {
  // 애플리케이션 설정 값들을 정의하는 객체
  config: {
    API_BASE_URL: "http://localhost:8081/api/posts", // 게시물 API의 기본 URL
    GUID_API_URL: "http://localhost:8081/api/guid/generate", // GUID 생성 API의 URL
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
      console.log(`[TRACE] Entering api._fetch with url: ${url}`);
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
          console.log(`[TRACE] Exiting api._fetch (JSON response)`);
          return response.json();
        }
        console.log(`[TRACE] Exiting api._fetch (Text response)`);
        return response.text();
      } catch (error) {
        console.error("API 호출 실패:", error);
        app.ui.showNotification(`API 요청 실패: ${error.message}`, "error");
        console.log(`[TRACE] Exiting api._fetch (Error)`);
        throw error; // 호출자가 오류를 처리할 수 있도록 다시 throw
      }
    },

    /** GUID를 생성하는 API를 호출하고 결과를 화면에 표시합니다. */
    async generateGuid() {
      console.log(`[TRACE] Entering api.generateGuid`);
      app.ui.showNotification("GUID 생성 중...", "info");
      try {
        const guid = await this._fetch(app.config.GUID_API_URL);
        app.elements.generatedGuidDisplay.textContent = guid;
        app.ui.showNotification("GUID가 성공적으로 생성되었습니다!", "success");
      } catch (error) {
        // _fetch에서 이미 알림을 처리하므로 별도 처리 없음
      }
      console.log(`[TRACE] Exiting api.generateGuid`);
    },

    /** 모든 게시물 목록을 조회하는 API를 호출합니다. */
    async getPosts() {
      console.log(`[TRACE] Entering api.getPosts`);
      const posts = await this._fetch(app.config.API_BASE_URL);
      console.log(`[TRACE] Exiting api.getPosts with ${posts.length} posts`);
      return posts;
    },

    /** 특정 ID의 게시물 상세 정보를 조회하는 API를 호출합니다. */
    async getPost(id) {
      console.log(`[TRACE] Entering api.getPost with id: ${id}`);
      const post = await this._fetch(`${app.config.API_BASE_URL}/${id}`);
      console.log(`[TRACE] Exiting api.getPost`);
      return post;
    },

    /** 새로운 게시물을 생성하는 API를 호출합니다. */
    async createPost(postData) {
      console.log(`[TRACE] Entering api.createPost`);
      const result = await this._fetch(app.config.API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      console.log(`[TRACE] Exiting api.createPost`);
      return result;
    },

    /** 기존 게시물을 수정하는 API를 호출합니다. */
    async updatePost(id, postData) {
      console.log(`[TRACE] Entering api.updatePost with id: ${id}`);
      const result = await this._fetch(`${app.config.API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      console.log(`[TRACE] Exiting api.updatePost`);
      return result;
    },

    /** 특정 ID의 게시물을 삭제하는 API를 호출합니다. */
    async deletePost(id) {
      console.log(`[TRACE] Entering api.deletePost with id: ${id}`);
      const result = await this._fetch(`${app.config.API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      console.log(`[TRACE] Exiting api.deletePost`);
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
      console.log(`[TRACE] Entering ui.showNotification with message: "${message}", type: "${type}"`);
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
      console.log(`[TRACE] Exiting ui.showNotification`);
    },

    /**
     * 사용자 정의 확인(Confirm) 모달을 표시합니다.
     * @param {string} message - 사용자에게 보여줄 질문 메시지
     * @param {function} callback - 사용자의 응답(true/false)을 처리할 콜백 함수
     */
    showConfirm(message, callback) {
      console.log(`[TRACE] Entering ui.showConfirm with message: "${message}"`);
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
        console.log(`[TRACE] ui.showConfirm - Confirmed`);
        cleanup();
        callback(true);
      };

      // 취소 버튼 클릭 시 처리
      const handleCancel = () => {
        console.log(`[TRACE] ui.showConfirm - Cancelled`);
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
      console.log(`[TRACE] Exiting ui.showConfirm`);
    },

    /**
     * 게시물 목록을 테이블에 렌더링합니다.
     * @param {Array<Object>} posts - 표시할 게시물 객체 배열
     */
    renderPosts(posts) {
      console.log(`[TRACE] Entering ui.renderPosts with ${posts ? posts.length : 0} posts`);
      const { postsTableBody } = app.elements;
      postsTableBody.innerHTML = ""; // 기존 목록 초기화
      if (!posts || posts.length === 0) {
        postsTableBody.innerHTML =
          '<tr><td colspan="3">게시물이 없습니다.</td></tr>';
        console.log(`[TRACE] Exiting ui.renderPosts (no posts)`);
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
      console.log(`[TRACE] Exiting ui.renderPosts`);
    },

    /**
     * 섹션을 전환하여 표시하거나 숨깁니다.
     * @param {string} sectionName - 표시할 섹션의 이름 ('list' 또는 'detail')
     */
    showSection(sectionName) {
      console.log(`[TRACE] Entering ui.showSection with sectionName: "${sectionName}"`);
      const { postListSection, postDetailSection } = app.elements;
      postListSection.style.display = sectionName === "list" ? "block" : "none";
      postDetailSection.style.display =
        sectionName === "detail" ? "block" : "none";
      console.log(`[TRACE] Exiting ui.showSection`);
    },

    /**
     * 게시물 상세/생성/수정 뷰를 준비하고 데이터를 채웁니다.
     * @param {string} mode - 뷰 모드 ('create', 'edit', 'view')
     * @param {Object} post - 표시할 게시물 데이터 (새 게시물 생성 시 빈 객체)
     */
    prepareDetailView(mode, post = {}) {
      console.log(`[TRACE] Entering ui.prepareDetailView with mode: "${mode}"`);
      const {
        detailTitle,
        postIdInput,
        postTitleInput,
        postContentInput,
        savePostBtn,
        deletePostBtn,
      } = app.elements;

      app.state.currentPostId = post.id || null;
      postIdInput.value = post.id || "";
      postTitleInput.value = post.title || "";
      postContentInput.value = post.content || "";

      const isReadOnly = mode === "view";
      postTitleInput.readOnly = isReadOnly;
      postContentInput.readOnly = isReadOnly;

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
      console.log(`[TRACE] Exiting ui.prepareDetailView`);
    },
  },

  // 이벤트 처리를 담당하는 핸들러 모듈
  handlers: {
    /** 게시물 목록을 불러와 화면에 렌더링합니다. */
    async loadAndRenderPosts() {
      console.log(`[TRACE] Entering handlers.loadAndRenderPosts`);
      try {
        const posts = await app.api.getPosts();
        app.ui.renderPosts(posts);
      } catch (error) {
        app.elements.postsTableBody.innerHTML =
          '<tr><td colspan="3">게시물을 불러올 수 없습니다.</td></tr>';
      }
      console.log(`[TRACE] Exiting handlers.loadAndRenderPosts`);
    },

    /** 새 게시물 작성 버튼 클릭 시 호출됩니다. */
    handleCreateClick() {
      console.log(`[TRACE] Entering handlers.handleCreateClick`);
      app.ui.prepareDetailView("create");
      console.log(`[TRACE] Exiting handlers.handleCreateClick`);
    },

    /** 게시물 저장 버튼 클릭 시 호출됩니다 (생성 또는 수정). */
    async handleSaveClick(event) {
      console.log(`[TRACE] Entering handlers.handleSaveClick`);
      event.preventDefault(); // 폼 제출 기본 동작 방지
      const { postIdInput, postTitleInput, postContentInput } = app.elements;

      const postData = {
        title: postTitleInput.value,
        content: postContentInput.value,
      };

      const id = postIdInput.value; // ID가 있으면 수정, 없으면 생성

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
      console.log(`[TRACE] Exiting handlers.handleSaveClick`);
    },

    /** 편집 취소 버튼 클릭 시 호출됩니다. */
    handleCancelClick() {
      console.log(`[TRACE] Entering handlers.handleCancelClick`);
      app.ui.showSection("list"); // 목록 뷰로 전환
      console.log(`[TRACE] Exiting handlers.handleCancelClick`);
    },

    /** 게시물 목록 테이블의 클릭 이벤트를 처리합니다 (이벤트 위임). */
    handleListClick(event) {
      console.log(`[TRACE] Entering handlers.handleListClick`);
      const { target } = event;
      const { id } = target.dataset; // 클릭된 요소의 data-id 속성

      if (!id) {
        console.log(`[TRACE] handlers.handleListClick - No ID found, ignoring.`);
        return;
      }

      if (target.classList.contains("view-post-link")) {
        event.preventDefault(); // 링크 기본 동작 방지
        console.log(`[TRACE] handlers.handleListClick - View post link clicked for id: ${id}`);
        this.viewPost(id);
      } else if (target.classList.contains("edit-btn")) {
        console.log(`[TRACE] handlers.handleListClick - Edit button clicked for id: ${id}`);
        this.editPost(id);
      } else if (target.classList.contains("delete-btn")) {
        console.log(`[TRACE] handlers.handleListClick - Delete button clicked for id: ${id}`);
        this.deletePost(id);
      }
      console.log(`[TRACE] Exiting handlers.handleListClick`);
    },

    /** 게시물 상세 뷰에서 삭제 버튼 클릭 시 호출됩니다. */
    handleDetailDeleteClick() {
      console.log(`[TRACE] Entering handlers.handleDetailDeleteClick`);
      if (app.state.currentPostId) {
        console.log(`[TRACE] handlers.handleDetailDeleteClick - Deleting post with id: ${app.state.currentPostId}`);
        this.deletePost(app.state.currentPostId);
      }
      console.log(`[TRACE] Exiting handlers.handleDetailDeleteClick`);
    },

    /** 특정 ID의 게시물 상세 정보를 불러와 표시합니다. */
    async viewPost(id) {
      console.log(`[TRACE] Entering handlers.viewPost with id: ${id}`);
      try {
        const post = await app.api.getPost(id);
        app.ui.prepareDetailView("view", post); // 읽기 전용 뷰 준비
      } catch (error) {
        // API 레이어에서 이미 알림을 처리함
      }
      console.log(`[TRACE] Exiting handlers.viewPost`);
    },

    /** 특정 ID의 게시물 정보를 불러와 수정 폼에 표시합니다. */
    async editPost(id) {
      console.log(`[TRACE] Entering handlers.editPost with id: ${id}`);
      try {
        const post = await app.api.getPost(id);
        app.ui.prepareDetailView("edit", post); // 수정 뷰 준비
      } catch (error) {
        // API 레이어에서 이미 알림을 처리함
      }
      console.log(`[TRACE] Exiting handlers.editPost`);
    },

    /** 특정 ID의 게시물을 삭제합니다. 사용자 확인 후 실행됩니다. */
    deletePost(id) {
      console.log(`[TRACE] Entering handlers.deletePost with id: ${id}`);
      app.ui.showConfirm(
        "정말로 이 게시물을 삭제하시겠습니까?",
        async (confirmed) => {
          console.log(`[TRACE] handlers.deletePost - Confirmation received: ${confirmed}`);
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
      console.log(`[TRACE] Exiting handlers.deletePost`);
    },
  },

  /** 애플리케이션 초기화 함수. DOM 로드 후 한 번 실행됩니다. */
  init() {
    console.log(`[TRACE] Entering app.init`);
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
      console.log(`[TRACE] Cached element: ${id} as ${camelCaseId}`);
    });

    // 핸들러 내부의 'this'가 app.handlers를 가리키도록 바인딩
    // (이벤트 리스너 콜백에서 'this'가 이벤트 타겟을 가리키는 것을 방지)
    Object.keys(this.handlers).forEach((key) => {
      this.handlers[key] = this.handlers[key].bind(this.handlers);
      console.log(`[TRACE] Bound handler: ${key}`);
    });

    // 이벤트 리스너 등록
    this.elements.createPostBtn.addEventListener(
      "click",
      this.handlers.handleCreateClick
    );
    console.log(`[TRACE] Event listener added for createPostBtn`);
    this.elements.savePostBtn.addEventListener(
      "click",
      this.handlers.handleSaveClick
    );
    console.log(`[TRACE] Event listener added for savePostBtn`);
    this.elements.cancelEditBtn.addEventListener(
      "click",
      this.handlers.handleCancelClick
    );
    console.log(`[TRACE] Event listener added for cancelEditBtn`);
    this.elements.postsTableBody.addEventListener(
      "click",
      this.handlers.handleListClick
    );
    console.log(`[TRACE] Event listener added for postsTableBody (delegation)`);
    this.elements.deletePostBtn.addEventListener(
      "click",
      this.handlers.handleDetailDeleteClick
    );
    console.log(`[TRACE] Event listener added for deletePostBtn (detail view)`);
    this.elements.generateGuidBtn.addEventListener(
      "click",
      this.api.generateGuid.bind(this.api)
    );
    console.log(`[TRACE] Event listener added for generateGuidBtn`);

    // 초기 데이터 로드 및 목록 뷰 표시
    this.handlers.loadAndRenderPosts();
    this.ui.showSection("list");
    console.log(`[TRACE] Exiting app.init`);
  },
};

// DOMContentLoaded 이벤트 발생 시 애플리케이션 초기화 함수 실행
document.addEventListener("DOMContentLoaded", () => {
  console.log(`[TRACE] DOMContentLoaded event fired, initializing app...`);
  app.init();
});
