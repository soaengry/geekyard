package com.soaengry.geekyard.global.util;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

public class NicknameGenerator {

    private static final List<String> ADJECTIVES = Arrays.asList(
            "강직한", "고요한", "고운", "기특한", "깜찍한", "근면한", "귀여운", "관대한", "깔끔한", "꾸준한",
            "긍정적인", "겸손한", "검소한", "공손한", "기운찬", "놀라운", "넉넉한", "느긋한", "낙천적인", "낭만적인",
            "다정한", "당당한", "든든한", "다재다능한", "또렷한", "다양한", "단호한", "대담한", "로맨틱한", "믿음직한",
            "명랑한", "매력적인", "맑은", "멋진", "반듯한", "발랄한", "부드러운", "빼어난", "밝은", "부지런한",
            "바른", "산뜻한", "수려한", "순진무구한", "순한", "싱그러운", "선한", "시원시원한", "사교적인", "섬세한",
            "사랑스러운", "성실한", "순수한", "소신있는", "섹시한", "사려깊은", "소탈한", "상냥한", "생기있는", "솔직한",
            "신중한", "싹싹한", "아리따운", "어여쁜", "예쁜", "용감한", "우아한", "위대한", "유능한", "유쾌한",
            "이해심 많은", "아름다운", "여유로운", "원만한", "유머러스한", "적극적인", "직선적인", "정의로운", "조용한", "재미있는",
            "정직한", "존귀한", "지혜로운", "자애로운", "자유로운", "지적인", "절약하는", "정숙한", "진취적인", "착한",
            "청초한", "창의적인", "침착한", "차분한", "친숙한", "친절한", "쾌활한", "튼튼한", "털털한", "편안한",
            "평화로운", "포근한", "훌륭한", "활동적인", "화사한", "화끈한", "합리적인", "활달한"
    );

    private static final List<String> NOUNS = Arrays.asList(
            "강아지", "고양이", "토끼", "다람쥐", "햄스터", "소", "돼지", "말", "양", "염소",
            "닭", "사자", "호랑이", "코끼리", "기린", "곰", "원숭이", "여우", "늑대", "하마",
            "코뿔소", "사슴", "얼룩말", "캥거루", "판다", "물고기", "고래", "돌고래", "상어", "문어",
            "오징어", "꽃게", "거북이", "참새", "비둘기", "까치", "독수리", "오리", "펭귄", "부엉이",
            "나비", "벌", "개미", "무당벌레", "지렁이", "거미", "뱀", "개구리", "도마뱀", "고슴도치",
            "너구리", "오소리", "수달", "해달", "물개", "바다표범", "바다코끼리", "나무늘보", "개미핥기", "아르마딜로",
            "두더지", "박쥐", "쥐", "멧돼지", "고라니", "노루", "낙타", "라마", "알파카", "당나귀",
            "무스", "순록", "수컷사자", "암사자", "표범", "치타", "하이에나", "자칼", "수리부엉이", "미어캣",
            "래트", "비버", "오리너구리", "가시두더지"
    );

    private static final Random random = new Random();

    /**
     * 랜덤 닉네임 생성: {형용사} {명사}
     */
    public static String generate() {
        String adjective = ADJECTIVES.get(random.nextInt(ADJECTIVES.size()));
        String noun = NOUNS.get(random.nextInt(NOUNS.size()));
        return adjective + " " + noun;
    }

    /**
     * seed 기반 결정적 닉네임 생성: 같은 seed → 같은 닉네임
     */
    public static String generate(long seed) {
        Random seeded = new Random(seed);
        String adjective = ADJECTIVES.get(seeded.nextInt(ADJECTIVES.size()));
        String noun = NOUNS.get(seeded.nextInt(NOUNS.size()));
        return adjective + " " + noun;
    }

    /**
     * 여러 개의 후보 닉네임 생성
     */
    public static List<String> generateCandidates(int count) {
        return random.ints(count, 0, ADJECTIVES.size())
                .mapToObj(i -> {
                    String adjective = ADJECTIVES.get(i);
                    String noun = NOUNS.get(random.nextInt(NOUNS.size()));
                    return adjective + " " + noun;
                })
                .distinct()
                .limit(count)
                .toList();
    }
}