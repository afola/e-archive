package com.banque.archives.controller;

import com.banque.archives.dto.KpiDTO;
import com.banque.archives.service.KpiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/kpis")
@RequiredArgsConstructor
@Tag(name = "KPIs", description = "API des indicateurs de performance")
public class KpiController {

    private final KpiService kpiService;

    @GetMapping
    @Operation(summary = "Obtenir tous les KPIs")
    public ResponseEntity<KpiDTO> getKpis() {
        return ResponseEntity.ok(kpiService.getKpis());
    }
}
