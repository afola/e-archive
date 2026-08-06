package com.banque.archives.dto;

import com.banque.archives.entity.ArchiveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchiveSearchRequest {

    private String search;
    private ArchiveStatus status;
    private String typeId;
    private String agencyId;
    private String confidentiality;
    private String clientName;
    private String accountNumber;
    private String dateFrom;
    private String dateTo;
    private String retentionFrom;
    private String retentionTo;
    private String department;
    private Boolean hasDigitalCopy;
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";
}
