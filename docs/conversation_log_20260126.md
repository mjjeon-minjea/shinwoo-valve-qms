# 🗨️ 2026-01-26 안티그래비티 대화 로그 (Setup Guide & Password)

> **Note**: 과장님 요청에 따라 대화 내용을 기록하여 저장합니다.

---

### [주제: 새 노트북 개발 환경 세팅 가이드]

**1. 필수 프로그램 설치**

- **Node.js**: [https://nodejs.org/](https://nodejs.org/) (LTS 버전)
- **Git**: [https://git-scm.com/downloads](https://git-scm.com/downloads)
- **VS Code**: [https://code.visualstudio.com/](https://code.visualstudio.com/)

**2. 프로젝트 다운로드 (Clone)**

- 명령어: `git clone https://github.com/mjjeon-minjea/shinwoo-valve-qms.git`
- 또는 GitHub에서 ZIP 다운로드 후 압축 해제.

**3. 환경 변수 설정 (.env)**

- 파일 생성: `.env`
- 내용 입력:
  ```ini
  VITE_SUPABASE_URL=https://qrmyhuipfkctgvzgdvmd.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybXlodWlwZmtjdGd2emdkdm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDA1NzIsImV4cCI6MjA4NDU3NjU3Mn0.066T-TgdnFfK_cJOdJPuHfSLpK0qxu_obi_diZBJMbo
  ```
- PowerShell 권한 에러 시 해결법:
  ```powershell
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

**4. 공구함 세팅 및 실행**

- 설치: `npm install`
- 실행: `npm run dev`

---

### [주제: 기억 테스트 (암호)]

**User (전민재 과장님):**

> "2026-01-26 오후 2:45 민재 대화 내용 안티그래비티 사랑한다"
> 기억해둬 다른 PC에서 물어볼꺼임

**Antigravity:**

> **[기록 완료]**
> 📅 시간: 2026-01-26 오후 2:45
> 🔑 암호: **"민재 대화 내용 안티그래비티 사랑한다"**

> (이후 확인 결과: 채팅 기록은 로컬 저장소에만 남으므로, 코드 저장소(GitHub)에 이 로그 파일을 올려서 동기화하기로 함)

---

### [주제: 미들웨어 & 게이트웨이 PC]

**게이트웨이 PC 구성안**

1.  **DB 접속 정보 요청** (전산실 막내)
    - DB 종류, IP, 포트, DB명, ID, PW
2.  **필요한 뷰(View) 3가지**
    - `V_QMS_INBOUND` (수입검사)
    - `V_QMS_PROCESS` (공정검사)
    - `V_ITEM_MASTER` (품목마스터 - 5만개)

**작동 방식**

- 게이트웨이 PC에 Node.js 미들웨어(우리가 만들 SW) 설치.
- 주기적으로 전산실 DB 조회 -> Supabase로 전송.

---

### [주제: DB 커넥터 및 커밋 오류 해결 (오후 4:50)]

**증상**

- `db_connector.js` 파일 작성 후 커밋 시 VS Code "소스 제어" 탭이 무한 로딩(Spinning) 걸림.
- "새로고침" 아이콘 비활성화.

**원인 및 해결**

1.  **원인**: `db_connector.js` 파일 자체의 문제가 아니라, VS Code의 Git UI 프로세스가 꼬여서 발생한 일시적 프리징 현상.
2.  **해결**:
    - 터미널에서 `git add .` 및 `git commit` 명령어로 수동 커밋 성공 (Commit ID: `75e761a`).
    - `taskkill` 명령어로 멈춰있던 `git.exe` 좀비 프로세스 강제 종료.
3.  **결과**: 정상화 완료. `db_connector.js` 및 동기화 서비스 코드 안전하게 저장됨.
