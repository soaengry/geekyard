import { FC, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../../auth/store/useAuthStore";
import EmailVerification from "../../auth/components/EmailVerification";
import {
  getMyFeeds,
  getLikedFeeds,
  getBookmarkedFeeds,
  getMyComments,
  getMyImageFeeds,
} from "../../feed/api/feedApi";
import { formatDate } from "../../../global/utils/formatDate";
import type { FeedResponse, CommentResponse } from "../../feed/types";
import type { PageResponse } from "../../anime/types";
import FeedCard from "../../feed/components/FeedCard";

const TABS = [
  "내 피드",
  "내 댓글",
  "좋아요",
  "북마크",
  "갤러리",
] as const;
type TabType = (typeof TABS)[number];

type DataType = "feed" | "comment";

const TAB_CONFIG: Record<TabType, { fetcher: (page: number) => Promise<PageResponse<FeedResponse | CommentResponse>>; type: DataType }> = {
  "내 피드": { fetcher: getMyFeeds, type: "feed" },
  "내 댓글": { fetcher: getMyComments, type: "comment" },
  "좋아요": { fetcher: getLikedFeeds, type: "feed" },
  "북마크": { fetcher: getBookmarkedFeeds, type: "feed" },
  "갤러리": { fetcher: getMyImageFeeds, type: "feed" },
};

const MyPage: FC = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [activeTab, setActiveTab] = useState<TabType>("내 피드");
  const [feeds, setFeeds] = useState<FeedResponse[]>([]);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (tab: TabType, pageNum: number, append = false) => {
      if (!append) setLoading(true);
      try {
        const config = TAB_CONFIG[tab];
        const data = await config.fetcher(pageNum);
        const updateHasMore = () => setHasMore(data.number < data.totalPages - 1);

        if (config.type === "feed") {
          setFeeds((prev) => append ? [...prev, ...data.content as FeedResponse[]] : data.content as FeedResponse[]);
        } else {
          setComments((prev) => append ? [...prev, ...data.content as CommentResponse[]] : data.content as CommentResponse[]);
        }
        updateHasMore();
        setPage(pageNum);
      } catch {
        toast.error("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setFeeds([]);
    setComments([]);
    setPage(0);
    fetchData(activeTab, 0);
  }, [activeTab, fetchData]);

  const handleLoadMore = () => {
    fetchData(activeTab, page + 1, true);
  };

  if (!user) return null;

  const tabType = TAB_CONFIG[activeTab].type;

  return (
    <div className="mypage max-w-2xl mx-auto">
      <h1 className="mypage-title text-2xl font-bold text-content mb-6">
        내 프로필
      </h1>
      <div className="mypage-profile bg-surface rounded-xl shadow-sm border border-content/10 p-6 mb-6">
        {user.profileImage && (
          <img
            src={user.profileImage}
            alt="프로필 이미지"
            className="w-20 h-20 rounded-full mb-4 object-cover"
          />
        )}
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-subtle">닉네임</span>
            <span className="ml-2 text-content">{user.nickname}</span>
          </p>
          <p>
            <span className="font-medium text-subtle">아이디</span>
            <span className="ml-2 text-content">{user.username}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-medium text-subtle">이메일</span>
            <span className="text-content">{user.email}</span>
            {user.emailVerified && (
              <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full font-medium">
                인증됨
              </span>
            )}
          </p>
          {user.bio && (
            <p>
              <span className="font-medium text-subtle">소개</span>
              <span className="ml-2 text-content">{user.bio}</span>
            </p>
          )}
        </div>
      </div>
      {user.authProvider === null && !user.emailVerified && (
        <div className="bg-surface rounded-xl shadow-sm border border-content/10 p-6 mb-6">
          <h2 className="text-base font-semibold text-content mb-1">
            이메일 인증
          </h2>
          <p className="text-sm text-subtle mb-3">
            서비스 이용을 위해 이메일 인증을 완료해주세요.
          </p>
          <EmailVerification
            email={user.email}
            isEmailValid={true}
            onVerified={() => updateUser({ ...user, emailVerified: true })}
          />
        </div>
      )}
      <div className="mypage-actions space-y-3 mb-8">
        <Link
          to="/me/edit"
          className="block w-full text-center bg-primary text-white rounded-md py-2 hover:bg-primary/90 transition-colors"
        >
          프로필 수정
        </Link>
        {user.authProvider === null && (
          <Link
            to="/me/password"
            className="block w-full text-center bg-surface text-content border border-content/20 rounded-md py-2 hover:bg-background transition-colors"
          >
            비밀번호 변경
          </Link>
        )}
        <Link
          to="/me/delete"
          className="block w-full text-center bg-error/10 text-error border border-error/20 rounded-md py-2 hover:bg-error/20 transition-colors"
        >
          계정 삭제
        </Link>
      </div>

      {/* Activity tabs */}
      <div className="mypage-activity">
        <div className="activity-tabs flex border-b border-content/10 mb-4 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`activity-tab whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors relative shrink-0 ${
                activeTab === tab
                  ? "text-primary"
                  : "text-subtle hover:text-content"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="activity-tab-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="activity-loading space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-content/10" />
            ))}
          </div>
        ) : (
          <div className="activity-content space-y-3">
            {tabType === "feed" &&
              (feeds.length > 0 ? (
                feeds.map((feed) => <FeedCard key={feed.id} feed={feed} />)
              ) : (
                <p className="activity-empty text-center text-subtle text-sm py-8">
                  데이터가 없습니다.
                </p>
              ))}

            {tabType === "comment" &&
              (comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="comment-item p-4 rounded-lg bg-surface border border-content/10"
                  >
                    <p className="text-sm text-content/80 whitespace-pre-line">
                      {comment.content}
                    </p>
                    <p className="text-xs text-subtle mt-2">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="activity-empty text-center text-subtle text-sm py-8">
                  데이터가 없습니다.
                </p>
              ))}

            {hasMore && (
              <button
                onClick={handleLoadMore}
                className="activity-load-more w-full py-2.5 text-sm rounded-lg bg-content/5 text-subtle hover:text-content hover:bg-content/10 transition-colors"
              >
                더보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
