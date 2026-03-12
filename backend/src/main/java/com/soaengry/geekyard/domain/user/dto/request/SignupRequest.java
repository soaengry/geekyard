package com.soaengry.geekyard.domain.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        String email,

        @NotBlank(message = "비밀번호는 필수입니다.")
        @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
        String password,

        @NotBlank(message = "닉네임은 필수입니다.")
        @Size(min = 2, max = 20, message = "닉네임은 2~20자이어야 합니다.")
        String nickname,

        @NotBlank(message = "사용자명은 필수입니다.")
        @Pattern(regexp = "^[a-z0-9_]{3,20}$", message = "사용자명은 영문 소문자, 숫자, 밑줄(_)만 사용 가능하며 3~20자이어야 합니다.")
        String username
) {}
