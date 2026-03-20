package com.soaengry.geekyard.domain.user.controller;

import com.soaengry.geekyard.domain.feed.dto.response.CommentResponse;
import com.soaengry.geekyard.domain.feed.dto.response.FeedResponse;
import com.soaengry.geekyard.domain.user.dto.request.RecoverAccountRequest;
import com.soaengry.geekyard.domain.user.dto.request.UpdateProfileRequest;
import com.soaengry.geekyard.domain.user.dto.response.MyProfileResponse;
import com.soaengry.geekyard.domain.user.dto.response.UserProfileResponse;
import com.soaengry.geekyard.domain.user.dto.response.WatchedCalendarResponse;
import com.soaengry.geekyard.domain.user.dto.response.WatchedStatisticsResponse;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.domain.user.service.UserActivityService;
import com.soaengry.geekyard.domain.user.service.UserService;
import com.soaengry.geekyard.global.common.ApiSuccessCode;
import com.soaengry.geekyard.global.common.SuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.soaengry.geekyard.global.util.PageRequestFactory;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserActivityService userActivityService;

    @GetMapping("/me")
    @ApiSuccessCode(SuccessCode.OK)
    public MyProfileResponse getMyProfile(@AuthenticationPrincipal User user) {
        return userService.getMyProfile(user);
    }

    @PatchMapping("/me")
    @ApiSuccessCode(SuccessCode.PROFILE_UPDATED)
    public MyProfileResponse updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return userService.updateProfile(user, request);
    }

    @PatchMapping("/me/profile-image")
    @ApiSuccessCode(SuccessCode.PROFILE_UPDATED)
    public MyProfileResponse updateProfileImage(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return userService.updateProfileImage(user, file);
    }

    @DeleteMapping("/me")
    @ApiSuccessCode(SuccessCode.ACCOUNT_DELETED)
    public Void deleteAccount(@AuthenticationPrincipal User user) {
        userService.deleteAccount(user);
        return null;
    }

    @PostMapping("/recover")
    @ApiSuccessCode(SuccessCode.ACCOUNT_RECOVERED)
    public Void recoverAccount(@Valid @RequestBody RecoverAccountRequest request) {
        userService.recoverAccount(request);
        return null;
    }

    @GetMapping("/{username}")
    @ApiSuccessCode(SuccessCode.OK)
    public UserProfileResponse getUserProfile(@PathVariable String username) {
        return userService.getUserProfile(username);
    }

    @GetMapping("/me/feeds")
    @ApiSuccessCode(SuccessCode.OK)
    public Page<FeedResponse> getMyFeeds(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userActivityService.getMyFeeds(user, PageRequestFactory.of(page, size));
    }

    @GetMapping("/me/liked-feeds")
    @ApiSuccessCode(SuccessCode.OK)
    public Page<FeedResponse> getLikedFeeds(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userActivityService.getLikedFeeds(user, PageRequestFactory.of(page, size));
    }

    @GetMapping("/me/bookmarked-feeds")
    @ApiSuccessCode(SuccessCode.OK)
    public Page<FeedResponse> getBookmarkedFeeds(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userActivityService.getBookmarkedFeeds(user, PageRequestFactory.of(page, size));
    }

    @GetMapping("/me/comments")
    @ApiSuccessCode(SuccessCode.OK)
    public Page<CommentResponse> getMyComments(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userActivityService.getMyComments(user, PageRequestFactory.of(page, size));
    }

    @GetMapping("/me/image-feeds")
    @ApiSuccessCode(SuccessCode.OK)
    public Page<FeedResponse> getMyImageFeeds(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userActivityService.getMyImageFeeds(user, PageRequestFactory.of(page, size));
    }

    @GetMapping("/me/watched/calendar")
    @ApiSuccessCode(SuccessCode.OK)
    public List<WatchedCalendarResponse> getWatchedCalendar(
            @AuthenticationPrincipal User user,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return userActivityService.getWatchedCalendar(user, year, month);
    }

    @GetMapping("/me/watched/statistics")
    @ApiSuccessCode(SuccessCode.OK)
    public WatchedStatisticsResponse getWatchedStatistics(@AuthenticationPrincipal User user) {
        return userActivityService.getWatchedStatistics(user);
    }
}
