package com.soaengry.geekyard.domain.chat.controller;

import com.soaengry.geekyard.domain.chat.dto.request.ChatMessageRequest;
import com.soaengry.geekyard.domain.chat.dto.response.ChatMessageResponse;
import com.soaengry.geekyard.domain.chat.service.ChatService;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.ApiSuccessCode;
import com.soaengry.geekyard.global.common.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/api/chat/{animeId}/messages")
    @ApiSuccessCode(SuccessCode.CHAT_MESSAGES)
    public List<ChatMessageResponse> getRecentMessages(@PathVariable Long animeId) {
        return chatService.getRecentMessages(animeId);
    }

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageRequest request, Principal principal) {
        UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken) principal;
        User user = (User) auth.getPrincipal();
        ChatMessageResponse response = chatService.saveMessage(request, user);
        messagingTemplate.convertAndSend("/topic/chat/" + request.animeId(), response);
    }
}
