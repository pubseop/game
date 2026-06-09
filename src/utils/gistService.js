const FILENAME = 'yacht_history.json';

export async function fetchGistHistory(token, gistId) {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: { Authorization: `token ${token}` },
  });
  if (!res.ok) throw new Error('Gist 불러오기 실패');
  const data = await res.json();
  const content = data.files[FILENAME]?.content;
  return content ? JSON.parse(content) : [];
}

export async function createGist(token, history) {
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'Yacht Dice History',
      public: false,
      files: { [FILENAME]: { content: JSON.stringify(history, null, 2) } },
    }),
  });
  if (!res.ok) throw new Error('Gist 생성 실패');
  const data = await res.json();
  return data.id;
}

export async function updateGist(token, gistId, history) {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: { [FILENAME]: { content: JSON.stringify(history, null, 2) } },
    }),
  });
  if (!res.ok) throw new Error('Gist 업데이트 실패');
}
