// 검색 데이터 목록
const data = [
    { title: '조작법', description: '기본 WSAD 조작법 \n W:위쪽 방향 이동 S:아래쪽 방향 이동 \n A: 왼쪽 방향 이동 D:오른쪽 방향 이동, 마우스 클릭: 공격 Tap: 무기 변경' },
    { title: '쥐', description: '일어섰을때 쥐를 쳐다보면 기절에 걸립니다! 쥐의 저돌적인 돌진에 맞게되면 경직이 걸리므로 스페이스바(상태이상 무적)을 활용한 플레이를 펼쳐보세요!' },
    { title: '박쥐', description: '박쥐는 여러분들이 상태이상일때 공격받는다면 여러분의 피를 흡혈합니다!<br> 박쥐는 피가 별로 없으므로 근거리에서 검을 이용한 공격이 더 치명적일 수 있습니다!' },  // 쥐가 일어섰을 때 뒤돌아본다는 내용이 이해가 되지 않음    { title: '슬라임', description: '8초마다 당신의 공격력이 절반으로 감소하도록 만듭니다. 일정 거리 밖에서 활을 이용한 원거리 공격이 더 치명적일 수 있습니다!'} 
    { title: '슬라임', description: '슬라임은 8초마다 플레이어의 공격력을 절반으로 감소시키는 디버프를 가지고 있습니다! 먼 거리에서 활로 쏘아 물리쳐 보세요!' },
    { title: '골렘-중간보스', description: '보스는 여러가지 기술을 사용 할 수 있습니다!<br> 가로,세로,대각선,중앙방향의 광역 폭발과 스페이스 바를 활용하여 돌진을 파악하고 피해보세요! <br>가끔 예상치 못한 박쥐떼에 조심하세요....' },
    { title: '최종보스', description: '평타: 전방 베기- 보스가 칼을 위로 드는 모션이 보이면 대쉬를 사용하거나 달려서 보스의 공격범위를 먼저 벗어나면 됩니다!<br>아래 찍기- 보스가 칼을 위로 들며 날이 바닥을 향하는 스킬에 맞게되면 기절에 걸립니다! 바닥에서 떨어저나온 폭발에 맞게된다면 피해만 입게됩니다!<br> 전방 6번 찌르기 후 뒤돌며 베기 - 전방 찌르기에 맞는 순간 플레이어가 경직효과에 걸리게 되어, 한 번 맞게되면 남은 찌르기를 모두 맞게됩니다! 칼을 뒤로 뺄때 범위에서 벗어나면 찌르기를 피할 수 있습니다!<br> (tip)뒤돌며 벨때 뒤쪽에서 칼로 맞받아 치면 보스가 무력화된다.<br> 보스가 웅크리고 빨간색으로 변했다면 공격하면 무시무시한 돌진이 플레이어에게 향할 것 입니다! 보스가 준비자세에 돌입할 때 공격을 멈추세요!' },
];

// 검색어 입력 시 보여줄 제안 목록
const suggestionsData = [
    '조작법', '쥐', '박쥐', '슬라임', '골렘-중간보스','최종보스'
];

// 검색창에 키를 입력했을 때 이벤트 리스너 추가
document.getElementById('searchInput').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') { // Enter 키를 눌렀을 때 검색 함수 호출
        search();
    }
    showSuggestions(); // 제안 목록 표시
    showQuestions(); // 질문 목록 표시
});

// 검색 기능을 수행하는 함수
function search() {
    const query = document.getElementById('searchInput').value.toLowerCase(); // 검색어 소문자 변환
    const resultsContainer = document.getElementById('results'); // 결과를 표시할 컨테이너
    resultsContainer.innerHTML = ''; // 기존 결과 초기화

    // 검색어와 일치하는 데이터를 필터링
    const results = data.filter(item => 
        item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
    );

    // 검색 결과가 없을 경우
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>'; // "결과가 없습니다." 메시지 표시
    } else {
        results.forEach(item => {
            const resultItem = document.createElement('div');
            
            let descriptionContent = item.description;
            if (descriptionContent.startsWith('http')) { // 설명이 링크로 시작하는 경우
                descriptionContent = `<a href="${descriptionContent}" target="_blank">${descriptionContent}</a>`;
            }

            resultItem.innerHTML = `<h2>${item.title}</h2><p>${descriptionContent}</p>`;
            resultsContainer.appendChild(resultItem); // 결과를 결과 컨테이너에 추가
        });
    }
}

// 질문 목록을 표시하는 함수 (현재 함수에서 사용되지 않음)
function showQuestions() {
    const questionsContainer = document.getElementById('questions'); // 질문을 표시할 컨테이너
    questionsContainer.innerHTML = ''; // 기존 질문 초기화
    questions.forEach(question => {
        const questionItem = document.createElement('div');
        questionItem.innerHTML = `<p>${question}</p>`;
        questionsContainer.appendChild(questionItem); // 질문을 컨테이너에 추가
    });
}

// 검색어와 일치하는 제안 목록을 표시하는 함수
function showSuggestions() {
    const query = document.getElementById('searchInput').value.toLowerCase(); // 검색어 소문자 변환
    const suggestionsContainer = document.getElementById('suggestions'); // 제안을 표시할 컨테이너
    suggestionsContainer.innerHTML = ''; // 기존 제안 초기화

    // 검색어와 일치하는 제안 필터링
    const suggestions = suggestionsData.filter(item => item.toLowerCase().includes(query));

    // 일치하는 제안이 있는 경우
    if (suggestions.length > 0) {
        suggestions.forEach(item => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item'; // 제안 항목에 클래스 추가
            suggestionItem.innerHTML = `<p onclick="selectSuggestion('${item}')">${item}</p>`;
            suggestionsContainer.appendChild(suggestionItem); // 제안을 컨테이너에 추가
        });
    }
}

// 사용자가 제안을 클릭했을 때 해당 제안을 검색어로 설정하고 검색을 수행하는 함수
function selectSuggestion(suggestion) {
    document.getElementById('searchInput').value = suggestion; // 검색창에 제안 설정
    search(); // 검색 수행
}

// 스크롤 시 네비게이션 바의 상태를 변경하는 함수
const navbar = document.querySelector(".navbar");
const NavbarHeight = navbar.getBoundingClientRect().height; // 네비게이션 바의 높이 측정

document.addEventListener("scroll", () => {
  if (window.scrollY > NavbarHeight) { // 스크롤이 네비게이션 바 높이보다 커지면
    navbar.classList.add("active"); // active 클래스 추가
  } else {
    navbar.classList.remove("active"); // active 클래스 제거
  }
});
