// API 기본 URL
const API_BASE_URL = '/api/posts';

// DOM 요소 캐싱
const postListSection = document.getElementById('post-list-section');
const postDetailSection = document.getElementById('post-detail-section');
const postsTableBody = document.getElementById('postsTableBody');
const createPostBtn = document.getElementById('createPostBtn');
const savePostBtn = document.getElementById('savePostBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const deletePostBtn = document.getElementById('deletePostBtn');
const postIdInput = document.getElementById('postId');
const postTitleInput = document.getElementById('postTitle');
const postContentInput = document.getElementById('postContent');
const detailTitle = document.getElementById('detailTitle');
const notificationContainer = document.getElementById('notification-container'); // 알림 컨테이너 추가
const customConfirmModal = document.getElementById('custom-confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmYesBtn = document.getElementById('confirm-yes-btn');
const confirmNoBtn = document.getElementById('confirm-no-btn');
const statusMessageBar = document.getElementById('status-message-bar'); // 게시판 하단 상태 메시지 바
const generateGuidBtn = document.getElementById('generateGuidBtn');
const generatedGuidDisplay = document.getElementById('generatedGuidDisplay');

let currentPostId = null; // 현재 선택된 게시물 ID

// 알림 표시 함수
function showNotification(message, type = 'info') {
    console.log(`Notification (${type}): ${message}`); // 콘솔에 알림 메시지 출력
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    // 게시판 하단 상태 메시지 업데이트
    if (statusMessageBar) {
        statusMessageBar.textContent = message;
        statusMessageBar.className = `status-bar status-${type}`; // Clear previous, add new type class
    }

    // 0.1초 후 투명도 효과를 위해 'show' 클래스 추가
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);


    // 3초 후 알림 숨기기 및 제거
    setTimeout(() => {
        notification.classList.remove('show');
        // 애니메이션이 끝난 후 요소 제거
        notification.addEventListener('transitionend', () => {
            notification.remove();
        }, { once: true });
    }, 3000);
}

// 커스텀 확인 모달 표시 함수
function showCustomConfirm(message, callback) {
    confirmMessage.textContent = message;
    customConfirmModal.style.display = 'flex'; // 모달 표시

    const handleConfirm = () => {
        customConfirmModal.style.display = 'none'; // 모달 숨기기
        confirmYesBtn.removeEventListener('click', handleConfirm);
        confirmNoBtn.removeEventListener('click', handleCancel);
        callback(true);
    };

    const handleCancel = () => {
        customConfirmModal.style.display = 'none'; // 모달 숨기기
        confirmYesBtn.removeEventListener('click', handleConfirm);
        confirmNoBtn.removeEventListener('click', handleCancel);
        callback(false);
    };

    confirmYesBtn.addEventListener('click', handleConfirm);
    confirmNoBtn.addEventListener('click', handleCancel);
}

// GUID 생성 함수
async function generateGuid() {
    showNotification('GUID 생성 중...', 'info');
    try {
        const response = await fetch('/api/guid/generate');
        if (response.ok) {
            const guid = await response.text();
            generatedGuidDisplay.textContent = guid;
            showNotification('GUID가 성공적으로 생성되었습니다!', 'success');
        } else {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
    } catch (error) {
        console.error('GUID 생성 중 오류 발생:', error);
        showNotification('GUID 생성에 실패했습니다: ' + error.message, 'error');
    }
}


// 게시물 목록 불러오기
async function fetchPosts() {
    try {
        const response = await fetch(API_BASE_URL);
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        console.error('게시물을 불러오는 중 오류 발생:', error);
        postsTableBody.innerHTML = '<tr><td colspan="3">게시물을 불러올 수 없습니다.</td></tr>';
        showNotification('게시물을 불러올 수 없습니다.', 'error');
    }
}

// 게시물 목록 렌더링
function renderPosts(posts) {
    postsTableBody.innerHTML = '';
    if (posts.length === 0) {
        postsTableBody.innerHTML = '<tr><td colspan="3">게시물이 없습니다.</td></tr>';
        return;
    }
    posts.forEach((post, index) => {
        const row = postsTableBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><a href="#" data-id="${post.id}" class="view-post-link">${post.title}</a></td>
            <td>
                <button class="action-btn edit-btn" data-id="${post.id}">수정</button>
                <button class="action-btn delete-btn" data-id="${post.id}">삭제</button>
            </td>
        `;
    });
}



// 게시물 상세 정보 불러오기 및 표시 (읽기 전용)
async function fetchPostDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const post = await response.json();
        detailTitle.textContent = '게시물 상세';
        postIdInput.value = post.id;
        postTitleInput.value = post.title;
        postContentInput.value = post.content;
        postTitleInput.readOnly = true;
        postContentInput.readOnly = true;
        savePostBtn.style.display = 'none'; // 저장 버튼 숨기기
        deletePostBtn.style.display = 'inline-block'; // 삭제 버튼 보이기
        currentPostId = id; // 현재 선택된 게시물 ID 저장
        showSection('detail');
    } catch (error) {
        console.error('게시물 상세 정보를 불러오는 중 오류 발생:', error);
        showNotification('게시물 상세 정보를 불러올 수 없습니다.', 'error');
    }
}

// 새 게시물 작성 폼 열기
function openCreateForm() {
    detailTitle.textContent = '새 게시물 작성';
    postIdInput.value = '';
    postTitleInput.value = '';
    postContentInput.value = '';
    postTitleInput.readOnly = false;
    postContentInput.readOnly = false;
    savePostBtn.style.display = 'inline-block'; // 저장 버튼 보이기
    deletePostBtn.style.display = 'none'; // 삭제 버튼 숨기기 (생성 시에는 삭제할 게시물 없음)
    currentPostId = null;
    showSection('detail');
}

// 게시물 수정 폼 열기 (데이터 로드 포함)
async function fetchPostToEdit(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const post = await response.json();
        detailTitle.textContent = '게시물 수정';
        postIdInput.value = post.id;
        postTitleInput.value = post.title;
        postContentInput.value = post.content;
        postTitleInput.readOnly = false;
        postContentInput.readOnly = false;
        savePostBtn.style.display = 'inline-block'; // 저장 버튼 보이기
        deletePostBtn.style.display = 'none'; // 삭제 버튼 숨기기 (여기서는 수정만)
        currentPostId = id;
        showSection('detail');
    } catch (error) {
        console.error('수정할 게시물 정보를 불러오는 중 오류 발생:', error);
        showNotification('수정할 게시물 정보를 불러올 수 없습니다.', 'error');
    }
}

// 게시물 저장 (생성 또는 수정)
async function savePost(event) {
    event.preventDefault();
    const id = postIdInput.value;
    const title = postTitleInput.value;
    const content = postContentInput.value;

    const postData = { title, content };

    try {
        let response;
        if (id) { // 수정
            response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
        } else { // 생성
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
        }

        if (response.ok) {
            showNotification('게시물이 성공적으로 저장되었습니다.', 'success');
            showSection('list');
            fetchPosts();
        } else {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
    } catch (error) {
        console.error('게시물 저장 중 오류 발생:', error);
        showNotification('게시물 저장에 실패했습니다: ' + error.message, 'error');
    }
}

// 게시물 삭제
async function deletePost(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('게시물이 성공적으로 삭제되었습니다.', 'success');
            showSection('list');
            fetchPosts();
        } else {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
    } catch (error) {
        console.error('게시물 삭제 중 오류 발생:', error);
        showNotification('게시물 삭제에 실패했습니다: ' + error.message, 'error');
    }
}

// 섹션 전환 함수
function showSection(section) {
    if (section === 'list') {
        postListSection.style.display = 'block';
        postDetailSection.style.display = 'none';
    } else {
        postListSection.style.display = 'none';
        postDetailSection.style.display = 'block';
    }
}

// 초기 로드 시 게시물 목록 불러오기
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();

    // postsTableBody에 이벤트 위임 (view-post-link, 수정 및 삭제 버튼)
    postsTableBody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('view-post-link')) {
            e.preventDefault();
            const id = target.dataset.id;
            fetchPostDetail(id);
        } else if (target.classList.contains('edit-btn')) {
            const id = target.dataset.id;
            fetchPostToEdit(id);
        } else if (target.classList.contains('delete-btn')) {
            const id = target.dataset.id;
            showCustomConfirm('정말로 이 게시물을 삭제하시겠습니까?', (confirmed) => {
                if (confirmed) {
                    deletePost(id);
                }
            });
        }
    });

    // 이벤트 리스너 등록
    createPostBtn.addEventListener('click', openCreateForm);
    savePostBtn.addEventListener('click', savePost);
    cancelEditBtn.addEventListener('click', () => showSection('list')); // 취소 버튼 클릭 시 목록으로 돌아가기
    generateGuidBtn.addEventListener('click', generateGuid);
});