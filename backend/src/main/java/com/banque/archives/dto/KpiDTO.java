package com.banque.archives.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiDTO {

    private long totalArchives;
    private long activeArchives;
    private long onLoanArchives;
    private long expiringArchives;
    private long pendingValidation;
    private long destroyedArchives;
    private long transferredArchives;
    private long totalMovements;
    private long pendingRequests;
    
    private List<ChartItem> archivesByType;
    private List<ChartItem> archivesByStatus;
    private List<ChartItem> archivesByAgency;
    private List<MonthlyData> monthlyMovements;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartItem {
        private String name;
        private long value;
        private String color;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month;
        private long entries;
        private long exits;
    }
}
