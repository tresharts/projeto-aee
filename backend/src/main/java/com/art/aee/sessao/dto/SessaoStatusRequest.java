package com.art.aee.sessao.dto;

import com.art.aee.sessao.SessaoStatus;
import jakarta.validation.constraints.NotNull;

public record SessaoStatusRequest(@NotNull SessaoStatus status) {}
