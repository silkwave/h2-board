/*
 * GUID를 미리 생성하여 큐에 저장하고, 요청 시 제공하는 싱글톤 클래스입니다.
 * 생산자-소비자 패턴을 사용하여 GUID 생성과 사용을 분리합니다
 */
package com.example.h2_board.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GuidService {

    // GUID 큐 관련 설정값 (하드코딩된 상수)
    private static final int QUEUE_CAPACITY = 100;

    // GUID를 저장할 LinkedBlockingQueue.
    private final LinkedBlockingQueue<UUID> guidQueue;

    // GUID 생성을 백그라운드에서 처리할 ExecutorService
    private ExecutorService producerExecutor;

    // 생성자에서 guidQueue를 초기화합니다.
    public GuidService() {
        this.guidQueue = new LinkedBlockingQueue<>(QUEUE_CAPACITY);
    }

    // 애플리케이션 시작 시 자동으로 큐를 채우고 생산자를 시작합니다.
    @PostConstruct
    public void init() {
        log.info("GUID 서비스 초기화 중...");

        producerExecutor = Executors.newSingleThreadExecutor( // 단일 스레드 ExecutorService 사용
            r -> {
                Thread t = new Thread(r, "GuidInfiniteProducer"); // 스레드 이름 변경
                t.setDaemon(true);
                return t;
            });
        
        // 무한 생성 태스크 실행
        producerExecutor.execute(this::startInfiniteGuidProduction);
        
        log.info("GUID 서비스 초기화 완료. GUID 무한 생산자 시작됨.");
    }

    // 애플리케이션 종료 시 생산자를 안전하게 종료합니다.
    @PreDestroy
    public void destroy() {
        log.info("GUID 서비스 종료 중...");
        if (producerExecutor != null) {
            producerExecutor.shutdownNow(); // 모든 실행 중인 작업 즉시 중단
            try {
                // 생산자가 종료될 때까지 최대 5초 대기
                if (!producerExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                    log.warn("GUID 무한 생산자가 5초 내에 종료되지 않았습니다.");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("GUID 무한 생산자 종료 중 인터럽트 발생.", e);
            }
        }
        log.info("GUID 서비스 종료 완료.");
    }

    /**
     * 큐에 GUID를 무한히 생성하여 추가합니다. 큐가 가득 차면 블로킹됩니다.
     */
    private void startInfiniteGuidProduction() {
        log.info("GUID 무한 생산 시작.");
        try {
            do {
                UUID guid = UUID.randomUUID();
                guidQueue.put(guid); // 큐가 가득 차면 여기서 블로킹됨
                log.debug("GUID 생산: [{}] (현재 큐 크기: {})", guid, guidQueue.size()); // trace -> debug로 변경
            } while (true); // 무한 루프
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.info("GUID 무한 생산 스레드 인터럽트 발생, 생산 중단.");
        } finally {
            log.info("GUID 무한 생산 종료.");
        }
    }

    /**
     * 큐에서 GUID를 가져옵니다. 큐가 비어있으면 요소가 생길 때까지 대기합니다.
     * @return 큐에서 가져온 GUID 문자열
     * @throws IllegalStateException 큐에서 GUID를 가져오는 중 스레드 인터럽트 발생 시
     */
    public String getGuid() {
        log.debug("GUID 요청 수신. 현재 큐 크기: {}", guidQueue.size());
        try {
            UUID retrievedGuid = guidQueue.take(); // 큐가 비어있으면 요소가 생길 때까지 대기
            log.debug("GUID 제공 완료. 남은 GUID 수: {}", guidQueue.size());
            return retrievedGuid.toString();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("GUID 가져오기 중 스레드 인터럽트 발생.", e);
            throw new IllegalStateException("GUID 생성 서비스를 사용할 수 없습니다.", e);
        }
    }
}
