/*
 * GUID를 미리 생성하여 큐에 저장하고, 요청 시 제공하는 싱글톤 클래스입니다.
 * 생산자-소비자 패턴을 사용하여 GUID 생성과 사용을 분리합니다
 */
package com.example.h2_board.service;

import jakarta.annotation.PostConstruct;
import java.util.UUID;
import java.util.concurrent.LinkedBlockingQueue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GuidService {

  // GUID를 저장할 LinkedBlockingQueue.
  // 생산자 스레드가 여기에 GUID를 넣고, 소비자 스레드가 가져가게 됩니다.
  private final LinkedBlockingQueue<UUID> guidQueue =
      new LinkedBlockingQueue<>(100); // 100개의 GUID 저장

  // 애플리케이션 시작 시 자동으로 큐를 채웁니다.
  @PostConstruct
  public void init() {
    log.trace("Initializing GUID Service");
    populateGuidQueue(100);
    log.trace("Finished initializing GUID Service");
  }

  /**
   * 지정된 수만큼 GUID를 생성하여 큐에 추가합니다.
   *
   * @param count 생성할 GUID 수
   */
  public void populateGuidQueue(int count) {
    log.trace("Entering populateGuidQueue with count: {}", count);
    for (int i = 0; i < count; i++) {
      try {
        UUID newGuid = UUID.randomUUID();
        guidQueue.put(newGuid); // 큐가 가득 차면 대기
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        log.error("GUID 큐 채우기 중 스레드 인터럽트: {}", e.getMessage());
        break;
      }
    }
    log.info("{}개의 GUID가 큐에 채워졌습니다.", count);
    log.trace("Exiting populateGuidQueue");
  }

  /**
   * 큐에서 GUID를 가져옵니다. 큐가 비어있으면 요소가 생길 때까지 대기합니다.
   *
   * @return 큐에서 가져온 GUID 문자열
   */
  public String getGuid() {
    log.trace("Entering getGuid");
    try {
      UUID retrievedGuid = guidQueue.take(); // 큐가 비어있으면 요소가 생길 때까지 대기
      log.trace("Exiting getGuid with a new GUID");
      return retrievedGuid.toString();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      log.error("GUID 가져오기 실패: 스레드 인터럽트", e);
      return "GUID 가져오기 실패: 스레드 인터럽트";
    }
  }
}
