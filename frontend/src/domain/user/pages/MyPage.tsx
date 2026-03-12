import { FC } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../auth/store/useAuthStore";
import EmailVerification from "../../auth/components/EmailVerification";

const MyPage: FC = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-content mb-6">내 프로필</h1>
      <div className="bg-surface rounded-xl shadow-sm border border-content/10 p-6 mb-6">
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
          <h2 className="text-base font-semibold text-content mb-1">이메일 인증</h2>
          <p className="text-sm text-subtle mb-3">서비스 이용을 위해 이메일 인증을 완료해주세요.</p>
          <EmailVerification
            email={user.email}
            isEmailValid={true}
            onVerified={() => updateUser({ ...user, emailVerified: true })}
          />
        </div>
      )}
      <div className="space-y-3">
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
    </div>
  );
};

export default MyPage;
