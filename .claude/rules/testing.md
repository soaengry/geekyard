## Testing

- **프레임워크**: JUnit 5 + AssertJ + MockMvc
- **설정**: `@SpringBootTest` + `@ActiveProfiles("test")` + `@Transactional`
- **패턴**: Given-When-Then, 한글 `@DisplayName`
- **위치**: `src/test/java/com/soaengry/geekyard/`
- **테스트 작성 기준**: 성공 케이스 + 실패 케이스(예외) 필수 작성
