// src/main/resources/static/js/app/api.js

import { config } from "./config.js";
import { ui } from "./ui.js";

/**
 * 공통 fetch 래퍼 함수 (모든 API 요청에 사용)
 * HTTP 응답을 처리하고 오류 발생 시 알림을 표시합니다.
 * @param {string} url - 요청할 URL
 * @param {object} options - fetch API에 전달할 옵션 (메서드, 헤더, 본문 등)
 * @returns {Promise<any>} - 서버 응답 (JSON 또는 텍스트)
 */
async function _fetch(url, options = {}) {
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
    ui.showNotification(`API 요청 실패: ${error.message}`, "error");
    throw error; // 호출자가 오류를 처리할 수 있도록 다시 throw
  }
}

/** GUID를 생성하는 API를 호출합니다. */
async function generateGuid() {
  const guid = await _fetch(config.GUID_API_URL);
  return guid;
}

/** 모든 게시물 목록을 조회하는 API를 호출합니다. */
async function getPosts() {
  const posts = await _fetch(config.API_BASE_URL);
  return posts;
}

/** 특정 ID의 게시물 상세 정보를 조회하는 API를 호출합니다. */
async function getPost(id) {
  const post = await _fetch(`${config.API_BASE_URL}/${id}`);
  return post;
}

/** 새로운 게시물을 생성하는 API를 호출합니다. */
async function createPost(postData) {
  const result = await _fetch(config.API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  return result;
}

/** 기존 게시물을 수정하는 API를 호출합니다. */
async function updatePost(id, postData) {
  const result = await _fetch(`${config.API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  return result;
}

/** 특정 ID의 게시물을 삭제하는 API를 호출합니다. */
async function deletePost(id) {
  const result = await _fetch(`${config.API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  return result;
}

/** 특정 게시물의 댓글 목록을 조회합니다. */
async function getComments(postId) {
    const comments = await _fetch(`${config.API_BASE_URL}/${postId}/comments`);
    return comments;
}

/** 특정 게시물에 댓글을 생성합니다. */
async function createComment(postId, commentData) {
    const result = await _fetch(`${config.API_BASE_URL}/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
    });
    return result;
}


export const api = {
  generateGuid,
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
};